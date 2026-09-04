import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { downloadPhotosAsZip, zipFileName } from "@/lib/zipDownload";
import HeaderBar from "@/components/HeaderBar";
import LandingHero from "@/components/home/LandingHero";
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
  const [zipping, setZipping] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    let on = true;
    base44.functions
      .invoke("listAlbums", {})
      .then(res => on && setAlbums(res.data?.albums ?? []))
      .catch(() => on && setAlbums([]));
    return () => {
      on = false;
    };
  }, []);

  const isAdmin = user?.role === "admin";
  // listAlbums already applies visibility rules server-side; this only hides
  // albums that expired between the fetch and now.
  const visible = useMemo(() => (albums ?? []).filter(a => !isAlbumExpired(a)), [albums]);
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
  }, [heroAlbum?.id, reloadKey]);

  // Signed photo URLs are only valid for an hour — refresh before they lapse.
  useEffect(() => {
    const timer = setInterval(() => setReloadKey(k => k + 1), 50 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const downloadAll = async () => {
    if (zipping) return;
    setZipping({ index: 0, total: heroPhotos?.length ?? 0 });
    try {
      const { skipped } = await downloadPhotosAsZip(heroPhotos, {
        zipName: zipFileName(heroAlbum?.title),
        onProgress: setZipping
      });
      if (skipped.length > 0) {
        toast({
          title: "Some photos were skipped",
          description: `${skipped.length} file(s) could not be fetched. The rest are in your ZIP.`
        });
      }
    } catch (err) {
      if (err?.name !== "AbortError") {
        toast({ title: "Download failed", description: err?.message || "Try again." });
      }
    } finally {
      setZipping(null);
    }
  };

  const downloadLabel = zipping
    ? `Zipping ${Math.min(zipping.index + 1, zipping.total)}/${zipping.total}`
    : "Download all";

  const q = search.trim().toLowerCase();
  const filtered = q
    ? visible.filter(
        a =>
          a.title?.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q)
      )
    : visible;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeaderBar search={search} onSearch={setSearch} />
      <LandingHero />
      <main className="mt-6 grid grid-cols-1 items-start gap-6 px-4 md:mt-[42px] md:px-[74px] lg:grid-cols-[1.76fr_.76fr]">
        <HeroWall
          album={heroAlbum}
          photos={heroPhotos}
          loading={albums === null}
          onOpen={setLightbox}
          onDownloadAll={heroPhotos?.length ? downloadAll : undefined}
          downloadLabel={downloadLabel}
          downloadBusy={!!zipping}
        />
        <ArchiveSidebar albums={visible} />
      </main>
      <section
        id="archive"
        className="mx-4 mb-20 mt-6 rounded-[28px] border border-[rgba(61,90,69,0.2)] bg-[rgba(250,252,249,0.64)] dark:border-white/10 dark:bg-[rgba(26,31,27,0.7)] p-6 backdrop-blur shadow-[0_12px_34px_rgba(46,77,55,0.08)] dark:shadow-none md:mx-[74px] md:mt-[42px] md:p-[34px]"
      >
        <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
          <h2 className="font-display text-[36px] font-medium leading-[1.08] tracking-[-1.3px]">
            The archive
          </h2>
          <span className="text-sm text-muted-foreground">{filtered.length} active</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {albums === null && <p className="text-sm text-muted-foreground">Loading archive…</p>}
          {albums !== null && filtered.length === 0 && (
            <div className="rounded-[17px] border border-dashed border-[#9bb19d] dark:border-[#46564a] p-6">
              <p className="font-semibold text-lg">No albums yet</p>
              <p className="mt-1.5 text-sm text-muted-foreground">
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