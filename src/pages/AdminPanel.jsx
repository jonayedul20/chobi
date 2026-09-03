import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import HeaderBar from "@/components/HeaderBar";
import CreateAlbumForm from "@/components/admin/CreateAlbumForm";
import AlbumAdminCard from "@/components/admin/AlbumAdminCard";

export default function AdminPanel() {
  const [albums, setAlbums] = useState(null);

  const load = () => {
    base44.entities.Album.list("-created_date", 100)
      .then(list => setAlbums(list ?? []))
      .catch(() => setAlbums([]));
  };

  useEffect(load, []);

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-black">
      <HeaderBar />
      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-10">
        <div>
          <h1 className="font-display font-extrabold uppercase text-[clamp(36px,6vw,64px)] leading-none tracking-tight">
            CONTROL ROOM
          </h1>
          <p className="font-mono text-xs text-[#777] uppercase mt-2">
            Admin only · full-resolution uploads · unique share links
          </p>
        </div>
        <CreateAlbumForm onCreated={load} />
        <section>
          <h2 className="font-display font-extrabold uppercase text-2xl mb-4 tracking-tight">
            ALL ALBUMS ({albums?.length ?? "…"})
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {(albums ?? []).map(a => (
              <AlbumAdminCard key={a.id} album={a} onChanged={load} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}