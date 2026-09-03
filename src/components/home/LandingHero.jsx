import React from "react";
import { ArrowDown, ImageIcon, Lock, MessageCircle } from "lucide-react";

const FEATURES = [
  {
    icon: ImageIcon,
    title: "Full-resolution originals",
    text: "Every frame is stored and shared exactly as it was shot. No compression, ever.",
  },
  {
    icon: Lock,
    title: "Private, protected links",
    text: "Each album gets its own unique link — optionally guarded by a password.",
  },
  {
    icon: MessageCircle,
    title: "Real-time discussion",
    text: "Chat with everyone viewing the album, right next to the photos.",
  },
];

export default function LandingHero() {
  return (
    <section className="bg-muted border-b border-border/50">
      <div className="px-6 pt-20 md:pt-28 pb-14 text-center">
        <h1 className="font-display font-semibold tracking-tighter text-foreground text-[clamp(48px,8vw,96px)] leading-[1.02]">
          Chobi <span className="text-primary">Archive</span>
        </h1>
        <p className="mt-5 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Full-resolution photo storage. No quality loss. Ever.
        </p>
        <a
          href="#archive"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Explore the archive <ArrowDown className="w-4 h-4" />
        </a>
      </div>
      <div className="max-w-5xl mx-auto px-4 md:px-8 pb-16 grid grid-cols-1 md:grid-cols-3 gap-4">
        {FEATURES.map(f => (
          <div key={f.title} className="rounded-2xl bg-card border border-border/60 p-6 text-center">
            <div className="mx-auto w-10 h-10 rounded-full bg-accent flex items-center justify-center">
              <f.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="mt-4 font-semibold text-sm tracking-tight">{f.title}</h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}