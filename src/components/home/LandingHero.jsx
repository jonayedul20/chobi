import React from "react";
import { ArrowDown, ImageIcon, Lock, MessageCircle } from "lucide-react";
import { Image } from "@/components/ui/image";

const PANEL =
  "rounded-[28px] border border-[rgba(61,90,69,0.2)] bg-[rgba(250,252,249,0.64)] backdrop-blur shadow-[0_12px_34px_rgba(46,77,55,0.08)] dark:border-white/10 dark:bg-[rgba(26,31,27,0.7)] dark:shadow-none";

const HERO_IMAGE =
  "https://media.base44.com/images/public/6a99f31ba5160b3896740f0a/3ae8279f2_generated_adf429f0.jpg";
const TILE_IMAGES = [
  "https://media.base44.com/images/public/6a99f31ba5160b3896740f0a/4d65e8087_generated_c7938267.jpg",
  "https://media.base44.com/images/public/6a99f31ba5160b3896740f0a/2d66a8445_generated_754d9c43.jpg"
];

const FEATURES = [
  {
    icon: ImageIcon,
    title: "Full-resolution originals",
    text: "Every frame is stored and shared exactly as it was shot. No compression, ever."
  },
  {
    icon: Lock,
    title: "Private, protected links",
    text: "Each album gets its own unique link — optionally guarded by a password."
  },
  {
    icon: MessageCircle,
    title: "Real-time discussion",
    text: "Chat with everyone viewing the album, right next to the photos."
  }
];

export default function LandingHero() {
  return (
    <>
      <section className="animate-sage-rise-slow relative mx-4 mt-[42px] flex min-h-[560px] items-end overflow-hidden rounded-[34px] bg-[#b8cdbb] p-8 shadow-[0_22px_60px_rgba(42,73,51,0.14)] md:mx-[74px] md:min-h-[704px] md:p-[68px]">
        <Image
          src={HERO_IMAGE}
          alt=""
          className="absolute inset-[-3%] h-[106%] w-[106%] animate-sage-drift"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,42,28,0.78),rgba(20,42,28,0.26)_58%,rgba(20,42,28,0.1))]" />
        <div className="absolute right-[64px] top-[62px] z-10 hidden gap-3 md:flex">
          {TILE_IMAGES.map(src => (
            <div
              key={src}
              className="h-[94px] w-[146px] overflow-hidden rounded-[18px] border border-white/55 shadow-[0_10px_24px_rgba(24,49,31,0.2)]"
            >
              <Image src={src} alt="" className="h-full w-full" />
            </div>
          ))}
        </div>
        <div className="relative z-10 max-w-[690px] text-[#f5f8f4]">
          <h1 className="font-display text-[clamp(56px,6vw,86px)] font-medium leading-[1.02] tracking-[-4px]">
            Chobi
          </h1>
          <p className="mt-2 max-w-[540px] text-[clamp(17px,1.6vw,21px)] leading-[1.5]">
            Private photo sharing, made personal.
          </p>
          <a
            href="#archive"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#f5f8f4] dark:bg-white/10 px-6 py-3 text-sm font-semibold text-[#1e3227] dark:text-foreground transition-colors duration-200 hover:bg-white dark:hover:bg-white/20"
          >
            Explore the archive <ArrowDown className="h-4 w-4" />
          </a>
        </div>
      </section>
      <div className="mx-4 mt-6 grid grid-cols-1 gap-6 md:mx-[74px] md:grid-cols-3">
        {FEATURES.map(f => (
          <div key={f.title} className={`${PANEL} flex items-start gap-4 p-6`}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d6e3d6] dark:bg-[#2a352c]">
              <f.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{f.text}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}