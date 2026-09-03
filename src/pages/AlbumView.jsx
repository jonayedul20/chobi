import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import HeaderBar from "@/components/HeaderBar";
import PhotoWall from "@/components/PhotoWall";
import CommandStrip from "@/components/CommandStrip";
import PasswordGate from "@/components/PasswordGate";
import AlbumChat from "@/components/AlbumChat";
import PhotoLightbox from "@/components/PhotoLightbox";
import { isAlbumExpired } from "@/lib/albums";

function CenterBlock({ kicker, title, children }) {
  return (
    <div className="min-h-screen bg-[#FFFDF5] flex flex-col">
      <HeaderBar />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="border-2 border-black bg-white max-w-md w-full">
          <div className="bg-black px-5 py-3 font-display font-extrabold uppercase text-[#CCFF00] tracking-tight">{kicker}</div>
          <div className="p-6 space-y-3">
            <h1 className="font-display font-extrabold uppercase text-2xl tracking-tight leading-tight">{title}</h1>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AlbumView() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [album, setAlbum] = useState(undefined);
  const [unlocked, setUnlocked] = useState(false);
  const [photos, setPhotos] = useState(null);
  const [gateError, setGateError] = useState("");
  const [busy, setBusy] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [msgCount, setMsgCount] = useState(null);

  useEffect(() => {
    let on = true;
    setAlbum(undefined);
    setUnlocked(false);
    setPhotos(null);
    base44.entities.Album.filter({ slug })
      .then(list => {
        if (!on) return;
        const found = list?.[0] ?? null;
        setAlbum(found);
        if (found && !found.has_password) setUnlocked(true);
      })
      .catch(() => on && setAlbum(null));
    return () => {
      on = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!unlocked || !album) return;
    let on = true;
    const pw = sessionStorage.getItem(`rawsnap_pw_${slug}`) ?? "";
    base44.functions
      .invoke("getAlbumPhotos", { slug, password: pw })
      .then(res => on && setPhotos(res.data?.photos ?? []))
      .catch(err => {
        if (!on) return;
        const code = err?.response?.data?.error || err?.data?.error;
        if (code === "EXPIRED") {
          setAlbum(a => (a ? { ...a, status: "expired" } : a));
          setUnlocked(false);
        } else if (code === "WRONG_PASSWORD" || code === "PASSWORD_REQUIRED") {
          sessionStorage.removeItem(`rawsnap_pw_${slug}`);
          setUnlocked(false);
          setGateError(code === "WRONG_PASSWORD" ? "WRONG PASSWORD — TRY AGAIN" : "");
        } else {
          setPhotos([]);
        }
      });
    return () => {
      on = false;
    };
  }, [unlocked, album?.id]);

  useEffect(() => {
    if (!user || !album) return;
    let on = true;
    base44.entities.ChatMessage.filter({ album_id: album.id }, "created_date", 500)
      .then(list => on && setMsgCount(list?.length ?? 0))
      .catch(() => {});
    const unsub = base44.entities.ChatMessage.subscribe(ev => {
      if (ev.data?.album_id !== album.id) return;
      setMsgCount(prev => {
        const cur = prev ?? 0;
        return ev.type === "delete" ? Math.max(0, cur - 1) : cur + 1;
      });
    });
    return () => {
      on = false;
      if (unsub) unsub();
    };
  }, [user?.id, album?.id]);

  const unlock = async pw => {
    setBusy(true);
    setGateError("");
    try {
      const res = await base44.functions.invoke("verifyAlbumPassword", { slug, password: pw });
      if (res.data?.valid) {
        sessionStorage.setItem(`rawsnap_pw_${slug}`, pw);
        setUnlocked(true);
      } else {
        setGateError("WRONG PASSWORD — TRY AGAIN");
      }
    } catch {
      setGateError("SOMETHING WENT WRONG — TRY AGAIN");
    } finally {
      setBusy(false);
    }
  };

  const downloadAll = () => {
    (photos ?? []).forEach((p, i) => {
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

  const isAdmin = user?.role === "admin";

  if (album === undefined) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#CCFF00]" />
      </div>
    );
  }

  if (!album) {
    return (
      <CenterBlock kicker="404 // NOT FOUND" title="NO SUCH ALBUM">
        <p className="text-sm text-[#777] font-body">This link doesn't match any album. Check the share link and try again.</p>
        <Link to="/" className="inline-block bg-[#CCFF00] text-black border-2 border-black px-4 py-2 font-display font-bold uppercase text-xs">BACK TO ARCHIVE</Link>
      </CenterBlock>
    );
  }

  if (isAlbumExpired(album)) {
    return (
      <CenterBlock kicker="EXPIRED" title={album.title}>
        <p className="text-sm text-[#777] font-body">
          This album's share window has closed. The link has expired — ask the owner to reactivate it.
        </p>
        <Link to="/" className="inline-block bg-[#CCFF00] text-black border-2 border-black px-4 py-2 font-display font-bold uppercase text-xs">BACK TO ARCHIVE</Link>
      </CenterBlock>
    );
  }

  if (!unlocked) {
    return <PasswordGate album={album} error={gateError} busy={busy} onSubmit={unlock} />;
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5] flex flex-col lg:flex-row">
      <div className="lg:w-[70%] bg-[#111111] flex flex-col min-h-screen pb-14 lg:pb-0">
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 z-10 p-4 md:p-6 pointer-events-none bg-gradient-to-b from-black/80 to-transparent">
            <Link to="/" className="font-mono text-[10px] text-[#CCFF00] hover:underline pointer-events-auto block mb-1">
              ← BACK TO ARCHIVE
            </Link>
            <h1 className="font-display font-extrabold uppercase text-white text-[clamp(28px,6vw,80px)] leading-[0.95] tracking-tight break-words">
              RAW_SNAP <span className="text-[#CCFF00]">//</span> {album.title}
            </h1>
            {album.description && (
              <p className="text-white/70 text-sm mt-2 font-body max-w-2xl">{album.description}</p>
            )}
          </div>
          {photos === null ? (
            <div className="min-h-[60vh] flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#CCFF00]" />
            </div>
          ) : photos.length === 0 ? (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 pt-32 px-4 text-center">
              <p className="font-display font-extrabold uppercase text-white text-xl tracking-tight">NO FRAMES YET</p>
              <p className="font-mono text-xs text-[#777] uppercase">
                {isAdmin ? "Upload originals from the control room." : "Check back soon."}
              </p>
              {isAdmin && (
                <Link to="/admin" className="bg-[#CCFF00] text-black px-4 py-2 font-display font-bold uppercase text-xs">
                  CONTROL ROOM →
                </Link>
              )}
            </div>
          ) : (
            <div className="pt-28 md:pt-36">
              <PhotoWall photos={photos} onOpen={setLightbox} />
            </div>
          )}
        </div>
        <div className="mt-auto">
          <CommandStrip album={album} showViewLink={false} onDownloadAll={photos?.length ? downloadAll : undefined} />
        </div>
      </div>

      <aside className="hidden lg:flex lg:w-[30%] border-l-2 border-black flex-col min-h-screen">
        <div className="bg-black px-4 py-3 border-b-2 border-black">
          <h2 className="font-display font-extrabold uppercase text-[#CCFF00] tracking-tight break-words">
            GROUP_CHAT // {album.title}
          </h2>
          <p className="font-mono text-[10px] text-white/60 uppercase mt-1">
            Google sign-in required · live for everyone with the link
          </p>
        </div>
        <div className="flex-1 min-h-0">
          <AlbumChat albumId={album.id} />
        </div>
      </aside>

      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-black border-t-2 border-[#CCFF00] grid grid-cols-2 h-14">
        <button
          onClick={() => setChatOpen(true)}
          className="text-[#CCFF00] font-display font-bold uppercase text-xs flex items-center justify-center gap-2 px-2"
        >
          SLIDE CHAT {msgCount != null ? `(${msgCount})` : ""}
        </button>
        <button
          onClick={downloadAll}
          disabled={!photos?.length}
          className="bg-[#CCFF00] text-black font-display font-bold uppercase text-xs flex items-center justify-center px-2 disabled:opacity-50"
        >
          DOWNLOAD ALL (ORIGINAL)
        </button>
      </div>

      {chatOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 flex items-end" onClick={() => setChatOpen(false)}>
          <div
            className="w-full h-[80vh] bg-[#FFFDF5] border-t-2 border-black flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-black px-4 py-3 flex items-center justify-between">
              <h2 className="font-display font-extrabold uppercase text-[#CCFF00] tracking-tight">GROUP_CHAT</h2>
              <button onClick={() => setChatOpen(false)} className="font-mono text-xs text-white underline">
                CLOSE
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <AlbumChat albumId={album.id} />
            </div>
          </div>
        </div>
      )}

      {lightbox != null && photos?.length ? (
        <PhotoLightbox
          photos={photos}
          index={lightbox}
          onIndex={setLightbox}
          onClose={() => setLightbox(null)}
        />
      ) : null}
    </div>
  );
}