import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import HeaderBar from "@/components/HeaderBar";
import HeroWall from "@/components/home/HeroWall";
import ArchiveSidebar from "@/components/home/ArchiveSidebar";
import AlbumCard from "@/components/AlbumCard";
import PhotoLightbox from "@/components/PhotoLightbox";
import { isAlbumExpired } from "@/lib/albums";

export default function Home() {
  const { user } = useAuth();
  const [albums, setAlbums] = useState(null);
  const [heroPhotos, setHeroPhotos] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let on = true;
    base44.entities.Album.list("-created_date", 100)
      .then(list => on && setAlbums(list ?? []))
      .catch(() => on && setAlbums([]));
    return () => {
      on = false;
    };
  }, []);

  const isAdmin = user?.role === "admin";
  const visible = useMemo(
    () => (albums ?? []).filter(a => !isAlbumExpired(a) && (a.is_public || isAdmin)),
    [albums, isAdmin]
  );
  const heroAlbum = visible[0] ?? null;

  useEffect(() => {
    if (!heroAlbum || heroAlbum.has_password) {
      setHeroPhotos([]);
      return;
    }
    let on = true;
    setHeroPhotos(null);
    base44.functions
      .invoke("getAlbumPhotos", { slug: heroAlbum.slug, password: "" })
      .then(res => on && setHeroPhotos(res.data?.photos ?? []))
      .catch(() => on && setHeroPhotos([]));
    return () => {
      on = false;
    };
  }, [heroAlbum?.id]);

  const downloadAll = () => {
    (heroPhotos ?? []).forEach((p, i) => {
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = p.signed_url;
        a.download = p.file_name || "photo";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }, i * 400);
    });
  };

  const q = search.trim().toLowerCase();
  const filtered = q
    ? visible.filter(
        a =>
          a.title?.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q)
      )
    : visible;

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-black">
      <HeaderBar search={search} onSearch={setSearch} />
      <div className="flex flex-col lg:flex-row">
        <div className="lg:w-[70%]">
          <HeroWall
            album={heroAlbum}
            photos={heroPhotos}
            loading={albums === null}
            onOpen={setLightbox}
            onDownloadAll={heroPhotos?.length ? downloadAll : undefined}
          />
        </div>
        <aside className="lg:w-[30%] border-t-2 lg:border-t-0 lg:border-l-2 border-black">
          <ArchiveSidebar albums={visible} user={user} />
        </aside>
      </div>
      <section className="border-t-2 border-black">
        <div className="px-4 md:px-8 pt-6 pb-2 flex items-end justify-between gap-4">
          <h2 className="font-display font-extrabold uppercase text-[clamp(28px,4vw,48px)] leading-none tracking-tight">
            THE ARCHIVE
          </h2>
          <span className="font-mono text-xs text-[#777]">{filtered.length} ACTIVE</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-4 md:p-8 pt-2">
          {albums === null && <p className="font-mono text-xs text-[#777] uppercase">Loading archive…</p>}
          {albums !== null && filtered.length === 0 && (
            <div className="border-2 border-black p-6">
              <p className="font-display font-extrabold uppercase text-lg tracking-tight">No albums yet</p>
              <p className="text-sm text-[#777] mt-1 font-body">
                {isAdmin
                  ? "Create your first album in the control room."
                  : "Check back soon — new albums drop here."}
              </p>
            </div>
          )}
          {filtered.map(a => (
            <AlbumCard key={a.id} album={a} />
          ))}
        </div>
      </section>
      {lightbox != null && heroPhotos?.length ? (
        <PhotoLightbox
          photos={heroPhotos}
          index={lightbox}
          onIndex={setLightbox}
          onClose={() => setLightbox(null)}
        />
      ) : null}
    </div>
  );
}