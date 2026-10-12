// Bundles the game (TypeScript) and writes a single self-contained demo page.
import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const out = await build({
  entryPoints: ["src/game/index.ts"], bundle: true, minify: true, format: "iife", globalName: "GooseTurf",
  loader: { ".css": "text" }, target: "es2020", write: false,
});
const js = out.outputFiles[0].text;
mkdirSync("public", { recursive: true });
writeFileSync("public/goose-game.js", js);
writeFileSync("public/kwc.json", readFileSync("../data/kwc.json"));
const data = readFileSync("../data/kwc.json", "utf8");
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Goose Turf: Kitchener-Waterloo-Cambridge</title>
<style>:root{box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
html,body{height:100%;margin:0;background:#0a2731}#app{height:100%}</style>
</head><body><div id="app"></div>
<script>${js}</script>
<script>GooseTurf.mount(document.getElementById("app"), ${data}, { apiBase: new URLSearchParams(location.search).get("api") || undefined });</script>
</body></html>`;
mkdirSync("dist", { recursive: true });
writeFileSync("dist/index.html", html);
console.log("js", js.length, "html", html.length);
