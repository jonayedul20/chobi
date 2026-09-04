import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ImageIcon, Loader2, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import HeaderBar from "@/components/HeaderBar";
import PhotoWall from "@/components/PhotoWall";
import CommandStrip from "@/components/CommandStrip";
import PasswordGate from "@/components/PasswordGate";
import AlbumChat from "@/components/AlbumChat";
import PhotoLightbox from "@/components/PhotoLightbox";
import { isAlbumExpired } from "@/lib/albums";

function CenterBlock({ kicker, title, children }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HeaderBar />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl bg-card border border-border/60 shadow-sm p-10 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-primary">{kicker}</p>
          <h1 className="mt-3 font-display font-semibold tracking-tighter text-2xl md:text-3xl break-words">
            {title}
          </h1>
          <div className="mt-4 space-y-4">{children}</div>
          <Link
            to="/"
            className="inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Back to archive
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AlbumView() {
  const { slug } = useParams();
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
    base44.functions
      .invoke("getAlbumMeta", { slug })
      .then(res => {
        if (!on) return;
        const found = res.data?.album ?? null;
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
          setGateError(code === "WRONG_PASSWORD" ? "Wrong password — try again." : "");
        } else {
          setPhotos([]);
        }
      });
    return () => {
      on = false;
    };
  }, [unlocked, album?.id]);

  useEffect(() => {
    if (!album) return;
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
  }, [album?.id]);

  const unlock = async pw => {
    setBusy(true);
    setGateError("");
    try {
      const res = await base44.functions.invoke("verifyAlbumPassword", { slug, password: pw });
      if (res.data?.valid) {
        sessionStorage.setItem(`rawsnap_pw_${slug}`, pw);
        setUnlocked(true);
      } else {
        setGateError("Wrong password — try again.");
      }
    } catch {
      setGateError("Something went wrong — try again.");
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

  if (album === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!album) {
    return (
      <CenterBlock kicker="404 · Not found" title="No such album">
        <p className="text-sm text-muted-foreground">
          This link doesn't match any album. Check the share link and try again.
        </p>
      </CenterBlock>
    );
  }

  if (isAlbumExpired(album)) {
    return (
      <CenterBlock kicker="Expired" title={album.title}>
        <p className="text-sm text-muted-foreground">
          This album's share window has closed. The link has expired — ask the owner to reactivate it.
        </p>
      </CenterBlock>
    );
  }

  if (!unlocked) {
    return <PasswordGate album={album} error={gateError} busy={busy} onSubmit={unlock} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      <div className="lg:w-[70%] flex flex-col min-h-screen pb-14 lg:pb-0">
        <div className="bg-muted px-6 py-12 md:py-14 text-center border-b border-border/50">
          <Link to="/" className="text-xs text-primary hover:underline">
            ← Back to archive
          </Link>
          <h1 className="mt-3 font-display font-semibold tracking-tighter text-foreground text-[clamp(30px,5vw,56px)] leading-[1.05] break-words">
            {album.title}
          </h1>
          {album.description && (
            <p className="mt-3 text-base text-muted-foreground max-w-2xl mx-auto">{album.description}</p>
          )}
        </div>
        {photos === null ? (
          <div className="min-h-[50vh] flex items-center justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
          </div>
        ) : photos.length === 0 ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-muted border border-border/60 flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-display font-semibold text-xl tracking-tight">Photos coming soon</p>
            <p className="text-sm text-muted-foreground">
              This album hasn't been published yet. Check back shortly.
            </p>
          </div>
        ) : (
          <div className="px-4 md:px-8 py-10">
            <PhotoWall photos={photos} onOpen={setLightbox} />
          </div>
        )}
        <div className="mt-auto">
          <CommandStrip album={album} showViewLink={false} onDownloadAll={photos?.length ? downloadAll : undefined} />
        </div>
      </div>

      <aside className="hidden lg:flex lg:w-[30%] border-l border-border flex-col min-h-screen">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-display font-semibold text-lg tracking-tight">Discussion</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Live for everyone with the link — just add your name to join.
          </p>
        </div>
        <div className="flex-1 min-h-0">
          <AlbumChat albumId={album.id} />
        </div>
      </aside>

      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur border-t border-border grid grid-cols-2 h-14">
        <button
          onClick={() => setChatOpen(true)}
          className="text-primary text-sm font-medium flex items-center justify-center gap-2 px-2"
        >
          Chat {msgCount != null ? `(${msgCount})` : ""}
        </button>
        <button
          onClick={downloadAll}
          disabled={!photos?.length}
          className="border-l border-border text-sm font-medium flex items-center justify-center px-2 disabled:opacity-50"
        >
          Download all
        </button>
      </div>

      {chatOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 flex items-end" onClick={() => setChatOpen(false)}>
          <div
            className="w-full h-[80vh] bg-background border-t border-border rounded-t-3xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-display font-semibold text-lg tracking-tight">Discussion</h2>
              <button onClick={() => setChatOpen(false)} aria-label="Close chat" className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
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