"use client";
// Loads the bundled game (public/goose-game.js, built from src/game by build-demo.mjs)
// and the map data, then mounts it. Set NEXT_PUBLIC_API_URL to mirror fixes to the API.
import Script from "next/script";
import { useRef } from "react";
import type { MapData, MountOptions } from "../src/game";

declare global {
  interface Window { GooseTurf?: { mount(root: HTMLElement, data: MapData, opts?: MountOptions): void } }
}

export default function GooseGame() {
  const root = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);

  async function start() {
    if (mounted.current || !root.current || !window.GooseTurf) return;
    mounted.current = true;
    const data = (await fetch("/kwc.json").then((r) => r.json())) as MapData;
    window.GooseTurf.mount(root.current, data, { apiBase: process.env.NEXT_PUBLIC_API_URL || undefined });
  }

  return (
    <>
      <Script src="/goose-game.js" strategy="afterInteractive" onReady={() => void start()} />
      <div ref={root} style={{ height: "100dvh" }} />
    </>
  );
}
