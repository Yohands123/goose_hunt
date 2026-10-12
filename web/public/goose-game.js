"use strict";var GooseTurf=(()=>{var Nt=Object.defineProperty;var De=Object.getOwnPropertyDescriptor;var Qe=Object.getOwnPropertyNames;var je=Object.prototype.hasOwnProperty;var Fe=(a,n)=>{for(var o in n)Nt(a,o,{get:n[o],enumerable:!0})},We=(a,n,o,r)=>{if(n&&typeof n=="object"||typeof n=="function")for(let p of Qe(n))!je.call(a,p)&&p!==o&&Nt(a,p,{get:()=>n[p],enumerable:!(r=De(n,p))||r.enumerable});return a};var Ve=a=>We(Nt({},"__esModule",{value:!0}),a);var la={};Fe(la,{mount:()=>Le});var pe=`:root {
  --gt-sea: #0f3a47;
  --gt-sea-deep: #0a2731;
  --gt-land: #3c4b49;
  --gt-panel: rgba(16, 33, 38, 0.92);
  --gt-panel-edge: #2f5560;
  --gt-paper: #f3ead2;
  --gt-ink: #1d1a17;
  --gt-text: #f3ead2;
  --gt-muted: #a9bdb9;
  --gt-gold: #ffd34d;
  --gt-ion: #006bb7;
  --gt-good: #5fc26b;
  --gt-warn: #f2a93b;
  --gt-bad: #e5533d;
  --gt-accent: #ffd34d;                      /* gold that stays readable on panels */
  --gt-accent-tint: rgba(255, 211, 77, 0.1);
  --gt-accent-glow: rgba(255, 211, 77, 0.45);
  --gt-tint: rgba(255, 255, 255, 0.08);      /* selected tab, list rows on panels */
  --gt-hairline: rgba(255, 255, 255, 0.08);
  --gt-track: rgba(0, 0, 0, 0.45);
  --gt-on-track: var(--gt-track);            /* switch when on */
  --gt-on-knob: var(--gt-good);
  --gt-display: "Lilita One", "Arial Rounded MT Bold", "Trebuchet MS", sans-serif;
  --gt-body: "Nunito", "Segoe UI", system-ui, sans-serif;
}
@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) {
    --gt-sea: #2f7487;
    --gt-sea-deep: #22596a;
    --gt-land: #56645f;
    --gt-panel: rgba(250, 245, 230, 0.95);
    --gt-panel-edge: #c9b98f;
    --gt-text: #1d1a17;
    --gt-muted: #5b6763;
    --gt-accent: #8a5d00;
    --gt-accent-tint: rgba(138, 93, 0, 0.08);
    --gt-accent-glow: rgba(138, 93, 0, 0.35);
    --gt-tint: rgba(29, 26, 23, 0.07);
    --gt-hairline: rgba(29, 26, 23, 0.12);
    --gt-track: rgba(29, 26, 23, 0.2);
    --gt-on-track: #3f9a4c;
    --gt-on-knob: #fff;
  }
}
:root[data-theme="dark"] {
  --gt-sea: #0f3a47; --gt-sea-deep: #0a2731; --gt-land: #3c4b49;
  --gt-panel: rgba(16, 33, 38, 0.92); --gt-panel-edge: #2f5560; --gt-text: #f3ead2; --gt-muted: #a9bdb9;
  --gt-accent: #ffd34d; --gt-accent-tint: rgba(255, 211, 77, 0.1); --gt-accent-glow: rgba(255, 211, 77, 0.45);
  --gt-tint: rgba(255, 255, 255, 0.08); --gt-hairline: rgba(255, 255, 255, 0.08); --gt-track: rgba(0, 0, 0, 0.45);
  --gt-on-track: var(--gt-track); --gt-on-knob: var(--gt-good);
}

.gt { position: relative; width: 100%; height: 100%; overflow: hidden; font-family: var(--gt-body); color: var(--gt-text);
  background: radial-gradient(ellipse at 50% 45%, var(--gt-sea) 0%, var(--gt-sea-deep) 75%); user-select: none; -webkit-user-select: none; }
.gt * { box-sizing: border-box; }
.gt button { font: inherit; color: inherit; cursor: pointer; }
.gt button:focus-visible, .gt [tabindex]:focus-visible { outline: 3px solid var(--gt-accent); outline-offset: 2px; }

/* ---------- map ---------- */
.gt-map { position: absolute; inset: 0; width: 100%; height: 100%; touch-action: none; cursor: grab; display: block; }
.gt-map.is-panning { cursor: grabbing; }
.gt-grid { stroke: rgba(255, 255, 255, 0.06); stroke-dasharray: 2 6; fill: none; }
.gt-region { fill: var(--gt-land); stroke: rgba(0, 0, 0, 0.55); stroke-width: 3; }
.gt-terr { stroke: var(--gt-ink); stroke-width: 2.2; stroke-linejoin: round; fill-opacity: 0.6; transition: fill-opacity 0.4s; }
.gt-terr.is-claimed { fill-opacity: 1; }
.gt-terr.is-here { fill-opacity: 0.85; }
.gt-terr.is-claimed.is-here { fill-opacity: 1; }
.gt-terr-shine { fill: none; stroke: rgba(255, 255, 255, 0.22); stroke-width: 1; }
.gt-city-edge { fill: none; stroke: var(--gt-ink); stroke-width: 4.5; stroke-linejoin: round; }
.gt-street { fill: none; stroke: rgba(243, 234, 210, 0.38); stroke-width: 1.4; stroke-linejoin: round; stroke-linecap: round; }
.gt-street.is-zone { stroke: var(--gt-gold); stroke-width: 3; }
.gt-ion { fill: none; stroke: var(--gt-ion); stroke-width: 5; stroke-linejoin: round; stroke-linecap: round; }
.gt-ion-casing { fill: none; stroke: #fff; stroke-width: 8; stroke-linejoin: round; stroke-linecap: round; }
.gt-stops { fill: rgba(243, 234, 210, 0.75); }
.gt-zone-fill { fill: url(#gt-hatch); stroke: var(--gt-gold); stroke-width: 3; stroke-dasharray: 10 6; animation: gt-march 1.2s linear infinite; }
.gt-zone-line { fill: none; stroke: url(#gt-hatch); stroke-linecap: round; stroke-linejoin: round; }
@keyframes gt-march { to { stroke-dashoffset: -16; } }
.gt-dim { fill: rgba(4, 14, 18, 0.42); pointer-events: none; }
.gt-hide-streets .gt-streets, .gt-hide-ion .gt-ion-layer, .gt-hide-stops .gt-stops { display: none; }
.gt:not(.z-near) .gt-stops, .gt:not(.z-mid) .gt-station-label, .gt:not(.z-far) .gt-terr-label { display: none; }

.gt-label { font-family: var(--gt-display); fill: var(--gt-paper); paint-order: stroke; stroke: var(--gt-ink); stroke-width: 3.5; stroke-linejoin: round; pointer-events: none; }
.gt-city-label { font-size: 26px; letter-spacing: 0.04em; opacity: 0.9; }
.gt-terr-label { font-size: 12px; }
.gt-station-label { font-family: var(--gt-body); font-weight: 800; font-size: 11px; fill: #fff; stroke: var(--gt-ion); stroke-width: 3; }
.gt-township { font-size: 15px; fill: rgba(243, 234, 210, 0.45); stroke-width: 0; font-family: var(--gt-display); }

.gt-badge circle { fill: var(--gt-paper); stroke-width: 3; }
.gt-badge text { font-family: var(--gt-display); font-size: 13px; fill: var(--gt-ink); text-anchor: middle; dominant-baseline: central; }
.gt-badge.is-claimed circle { stroke: var(--gt-gold); stroke-width: 3.5; }
.gt-badge.is-claimed text { fill: #fff; }
.gt-badge.pop { animation: gt-pop 0.45s ease-out; }
@keyframes gt-pop { 40% { transform: scale(1.5); } }
.gt-station { fill: #fff; stroke: var(--gt-ion); stroke-width: 2.5; }

/* goose */
.gt-goose { cursor: grab; }
.gt-goose.is-carried { cursor: grabbing; }
.gt-goose-shadow { fill: rgba(0, 0, 0, 0.35); }
.gt-goose .gw-body { animation: gt-waddle 0.5s ease-in-out infinite alternate; transform-origin: 0 20px; }
.gt-goose .gw-leg-a { animation: gt-step 0.5s ease-in-out infinite alternate; }
.gt-goose .gw-leg-b { animation: gt-step 0.5s ease-in-out infinite alternate-reverse; }
.gt-goose .gd-car { animation: gt-bump 0.28s ease-in-out infinite alternate; }
.gt-goose .gf-wing { animation: gt-flap 0.32s ease-in-out infinite alternate; transform-origin: 0 -3px; }
.gt-goose .gc-wl, .gt-goose .gc-wr { animation: gt-flutter 0.18s ease-in-out infinite alternate; }
.gt-goose .gc-wl { transform-origin: -5px 0; } .gt-goose .gc-wr { transform-origin: 5px 0; --dir: -1; }
@keyframes gt-waddle { from { transform: rotate(-6deg); } to { transform: rotate(6deg); } }
@keyframes gt-step { from { transform: translateY(0); } to { transform: translateY(-3px); } }
@keyframes gt-bump { to { transform: translateY(-1.5px); } }
@keyframes gt-flap { from { transform: scaleY(1); } to { transform: scaleY(-0.55); } }
@keyframes gt-flutter { to { transform: rotate(calc(var(--dir, 1) * 12deg)); } }
.gt-bubble rect { fill: #fff; stroke: var(--gt-ink); stroke-width: 2; }
.gt-bubble text { font-family: var(--gt-display); font-size: 14px; fill: var(--gt-ink); text-anchor: middle; dominant-baseline: central; }
.gt-bubble { transition: opacity 0.2s; }

/* ---------- HUD ---------- */
.gt-panel { position: absolute; background: var(--gt-panel); border: 2px solid var(--gt-panel-edge); border-radius: 14px;
  box-shadow: 0 6px 0 rgba(0, 0, 0, 0.35); backdrop-filter: blur(4px); }
.gt-iconbtn { width: 46px; height: 46px; border-radius: 50%; border: 2px solid var(--gt-panel-edge); background: var(--gt-panel);
  display: grid; place-items: center; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.35); transition: transform 0.1s; }
.gt-iconbtn:active { transform: translateY(3px); box-shadow: 0 1px 0 rgba(0, 0, 0, 0.35); }
.gt-iconbtn svg { width: 22px; height: 22px; }

.gt-tl { position: absolute; top: 12px; left: 12px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; max-width: calc(100% - 300px); }
.gt-zonechip { padding: 6px 14px 6px 8px; display: flex; align-items: center; gap: 10px; position: static; border-radius: 999px; }
.gt-zonechip b { font-family: var(--gt-display); font-weight: 400; font-size: 20px; }
.gt-zonechip small { display: block; color: var(--gt-muted); font-size: 12px; line-height: 1.1; }
.gt-swatch { width: 26px; height: 26px; border-radius: 8px; border: 2px solid var(--gt-ink); flex: none; }

.gt-stats { top: 12px; right: 12px; width: 236px; padding: 12px 14px; }
.gt-speed { display: flex; align-items: baseline; gap: 6px; }
.gt-speed b { font-family: var(--gt-display); font-weight: 400; font-size: 44px; line-height: 1; font-variant-numeric: tabular-nums; }
.gt-speed span { color: var(--gt-muted); font-weight: 800; }
.gt-motion { font-family: var(--gt-display); font-size: 17px; color: var(--gt-accent); margin: 2px 0 8px; }
.gt-kv { display: grid; grid-template-columns: auto 1fr; gap: 3px 10px; font-size: 13px; }
.gt-kv dt { color: var(--gt-muted); }
.gt-kv dd { margin: 0; text-align: right; font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.gt-cities { top: 228px; right: 12px; width: 236px; display: grid; gap: 8px; position: absolute; }
.gt-city { padding: 8px 10px; display: grid; grid-template-columns: 34px 1fr auto; gap: 2px 10px; align-items: center; position: static; }
.gt-city .gt-swatch { grid-row: span 2; width: 34px; height: 34px; border-radius: 10px; }
.gt-city b { font-family: var(--gt-display); font-weight: 400; font-size: 17px; }
.gt-city .gt-count { font-family: var(--gt-display); font-size: 17px; }
.gt-bar { grid-column: 2 / 4; height: 6px; border-radius: 3px; background: rgba(0, 0, 0, 0.35); overflow: hidden; }
.gt-bar i { display: block; height: 100%; background: var(--gt-gold); width: 0; transition: width 0.4s; }

.gt-bl { left: 12px; bottom: 12px; width: 300px; max-height: 46%; display: flex; flex-direction: column; }
.gt-tabs { display: flex; gap: 4px; padding: 6px 6px 0; }
.gt-tab { flex: 1; border: 0; background: transparent; padding: 7px 8px; border-radius: 9px 9px 0 0; font-weight: 800; color: var(--gt-muted) !important; }
.gt-tab[aria-selected="true"] { background: var(--gt-tint); color: var(--gt-text) !important; }
.gt-list { list-style: none; margin: 0; padding: 6px 10px 10px; overflow: auto; font-size: 13px; }
.gt-list li { display: grid; grid-template-columns: 22px 1fr auto; gap: 8px; align-items: center; padding: 5px 0; border-bottom: 1px solid var(--gt-hairline); }
.gt-list li:last-child { border-bottom: 0; }
.gt-list .gt-ico { width: 22px; height: 22px; border-radius: 6px; display: grid; place-items: center; font-size: 12px; font-weight: 900; color: #fff; }
.gt-list .gt-dist { color: var(--gt-muted); font-variant-numeric: tabular-nums; font-weight: 700; display: flex; gap: 4px; align-items: center; }
.gt-arrow { display: inline-block; width: 12px; text-align: center; }
.gt-empty { color: var(--gt-muted); padding: 10px 0; display: block !important; }

.gt-hud { left: 50%; bottom: 12px; transform: translateX(-50%); display: flex; align-items: center; gap: 12px; padding: 8px 18px 8px 8px; border-radius: 999px; }
.gt-avatar { width: 68px; height: 68px; border-radius: 50%; background: radial-gradient(circle at 40% 35%, #8fd3e8, #2b7d95); border: 3px solid var(--gt-paper);
  box-shadow: 0 0 0 3px var(--gt-ink); display: grid; place-items: center; flex: none; }
.gt-avatar svg { width: 54px; height: 54px; }
.gt-hud-name { font-family: var(--gt-display); font-size: 18px; }
.gt-health { width: 170px; height: 14px; border-radius: 7px; background: rgba(0, 0, 0, 0.45); border: 2px solid var(--gt-ink); overflow: hidden; margin: 3px 0 4px; }
.gt-health i { display: block; height: 100%; width: 100%; background: var(--gt-good); transition: background-color 0.3s; }
.gt-banner { display: inline-block; font-family: var(--gt-display); font-size: 15px; letter-spacing: 0.03em; padding: 1px 12px; border-radius: 6px;
  background: var(--gt-ion); color: #fff; border: 2px solid var(--gt-ink); }

.gt-br { position: absolute; right: 12px; bottom: 12px; display: flex; flex-direction: column; gap: 8px; align-items: flex-end; }
.gt-toggle { padding: 8px 12px; display: flex; align-items: center; gap: 10px; position: static; text-align: left; border-radius: 12px; }
.gt-toggle b { display: block; font-size: 14px; }
.gt-toggle small { display: block; color: var(--gt-muted); font-size: 12px; }
.gt-br .gt-toggle { align-self: stretch; }

/* GPS smoothing: the engineering showcase, so it gets a highlighted card */
.gt-toggle-hero { padding: 10px 14px 10px 12px; border-color: var(--gt-accent); gap: 12px;
  background: linear-gradient(var(--gt-accent-tint), var(--gt-accent-tint)), var(--gt-panel);
  animation: gt-beckon 1.6s ease-in-out 1s 4; }
.gt-toggle-hero[aria-pressed="false"] { border-color: var(--gt-warn); }
.gt-toggle-hero b { font-family: var(--gt-display); font-weight: 400; font-size: 19px; line-height: 1.15; }
.gt-eyebrow { display: block; font-size: 10.5px; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; color: var(--gt-accent); }
.gt-toggle-hero .gt-flips { color: var(--gt-text); margin-top: 2px; }
.gt-flips span { font-family: var(--gt-display); font-size: 15px; color: var(--gt-accent); font-variant-numeric: tabular-nums; }
@keyframes gt-beckon { 50% { box-shadow: 0 6px 0 rgba(0, 0, 0, 0.35), 0 0 0 7px var(--gt-accent-glow); } }
.gt-switch { width: 38px; height: 22px; border-radius: 11px; background: var(--gt-track); position: relative; flex: none; border: 2px solid var(--gt-ink); }
.gt-switch::after { content: ""; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; border-radius: 50%; background: var(--gt-muted); transition: transform 0.15s, background 0.15s; }
[aria-pressed="true"] .gt-switch { background: var(--gt-on-track); }
[aria-pressed="true"] .gt-switch::after { transform: translateX(16px); background: var(--gt-on-knob); }
.gt-zoom { display: flex; gap: 8px; }

.gt-warn { position: absolute; top: 72px; left: 50%; transform: translateX(-50%); padding: 8px 16px; background: var(--gt-bad); color: #fff;
  border: 2px solid var(--gt-ink); border-radius: 12px; font-weight: 800; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.35); display: none; white-space: nowrap; }
.gt-warn.show { display: block; }

/* ---------- intro card (first visit) ---------- */
.gt-intro { left: 50%; bottom: 116px; transform: translateX(-50%); width: min(540px, calc(100% - 24px)); z-index: 4;
  padding: 16px 18px 16px 14px; display: none; grid-template-columns: 64px 1fr; gap: 14px; align-items: start;
  border-color: var(--gt-accent); }
.gt-intro.show { display: grid; animation: gt-rise 0.35s ease-out; }
.gt-intro-art { width: 64px; height: 64px; border-radius: 50%; background: radial-gradient(circle at 40% 35%, #8fd3e8, #2b7d95);
  border: 3px solid var(--gt-paper); box-shadow: 0 0 0 3px var(--gt-ink); display: grid; place-items: center; }
.gt-intro-art svg { width: 50px; height: 50px; }
.gt-intro h2 { font-family: var(--gt-display); font-weight: 400; font-size: 24px; margin: 2px 40px 6px 0; }
.gt-intro p { margin: 0 0 8px; font-size: 14.5px; line-height: 1.45; }
.gt-intro-tip { color: var(--gt-muted); }
.gt-intro-tip b { color: var(--gt-accent); }
.gt-intro-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.gt-intro-actions .gt-primary { margin-top: 2px; padding: 8px 18px; font-size: 17px; }
.gt-intro-actions small { color: var(--gt-muted); font-size: 12.5px; }
@keyframes gt-rise { from { opacity: 0; transform: translate(-50%, 12px); } }

/* ---------- modals ---------- */
.gt-modal { position: absolute; inset: 0; background: rgba(4, 14, 18, 0.6); display: none; place-items: center; padding: 16px; z-index: 5; }
.gt-modal.show { display: grid; }
.gt-card { position: relative; width: min(520px, 100%); max-height: 86%; overflow: auto; padding: 20px 22px; }
.gt-card h2 { font-family: var(--gt-display); font-weight: 400; font-size: 28px; margin: 0 0 6px; }
.gt-card h3 { font-family: var(--gt-display); font-weight: 400; font-size: 19px; margin: 18px 0 4px; }
.gt-card p, .gt-card li { line-height: 1.5; font-size: 15px; max-width: 64ch; }
.gt-card ul { padding-left: 18px; }
.gt-close { position: absolute; top: 12px; right: 12px; width: 36px; height: 36px; }
.gt-picks { display: grid; gap: 8px; margin-top: 12px; }
.gt-pick { display: grid; grid-template-columns: 30px 1fr; gap: 2px 12px; align-items: center; text-align: left; padding: 10px 12px;
  background: var(--gt-tint); border: 2px solid transparent; border-radius: 12px; }
.gt-pick .gt-swatch { grid-row: span 2; width: 30px; height: 30px; }
.gt-pick b { font-size: 16px; }
.gt-pick small { color: var(--gt-muted); }
.gt-pick[aria-current="true"] { border-color: var(--gt-accent); }
.gt-primary { margin-top: 14px; padding: 12px 20px; border-radius: 12px; border: 2px solid var(--gt-ink); background: var(--gt-gold); color: var(--gt-ink) !important;
  font-family: var(--gt-display) !important; font-size: 18px; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.35); }
.gt-states { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; margin: 10px 0; }
.gt-states div { display: flex; gap: 8px; align-items: center; font-size: 14px; }
.gt-states svg { width: 44px; height: 44px; flex: none; }
.gt-layers { top: 66px; left: 12px; padding: 10px 14px; display: none; z-index: 4; }
.gt-layers.show { display: block; }
.gt-layers label { display: flex; gap: 8px; align-items: center; padding: 4px 0; font-weight: 700; cursor: pointer; }
.gt-attrib { position: absolute; left: 50%; bottom: 0; transform: translateX(-50%); font-size: 10px; color: var(--gt-muted); opacity: 0.8; white-space: nowrap; pointer-events: none; display: none; }

/* ---------- short desktop windows ---------- */
@media (min-width: 861px) and (max-height: 710px) {
  .gt-kv .gt-kv-extra { display: none; }
  .gt-cities { top: 170px; }
  .gt-br .gt-toggle:not(.gt-toggle-hero) small { display: none; }
}

/* ---------- small screens ---------- */
@media (max-width: 860px) {
  .gt-cities { display: none; }
  .gt-tl { max-width: calc(100% - 190px); }
  .gt-stats { width: 170px; padding: 8px 10px; }
  .gt-speed b { font-size: 32px; }
  .gt-kv { font-size: 11px; }
  .gt-kv .gt-kv-extra { display: none; }
  .gt-bl { width: calc(100% - 24px); max-height: 30%; bottom: 112px; }
  .gt-hud { left: 12px; transform: none; padding-right: 12px; }
  .gt-avatar { width: 54px; height: 54px; } .gt-avatar svg { width: 44px; height: 44px; }
  .gt-health { width: 110px; }
  .gt-toggle small { display: none; }
  .gt-zoom { display: none; }
  .gt-toggle-hero .gt-eyebrow { display: none; }
  .gt-intro { bottom: 176px; grid-template-columns: 1fr; }  /* clear of the toggle column */
  .gt-intro-art { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .gt-goose * , .gt-zone-fill, .gt-toggle-hero, .gt-intro { animation: none !important; }
}
`;var $="#1d1a17",wt="#8a6c4c",vt="#dccbad",st="#5f4730",fe="#3f2e1f",lt=(a,n,o=!0)=>`
  <ellipse cx="${a}" cy="${n}" rx="6.4" ry="4.5" fill="${$}"/>
  <ellipse cx="${a-1.8}" cy="${n+1.2}" rx="3.2" ry="1.7" fill="#fff" transform="rotate(-12 ${a-1.8} ${n+1.2})"/>
  <path d="M${a+5.5} ${n-1.5} L${a+12} ${n+.5} L${a+5.5} ${n+2.2}Z" fill="${$}"/>
  ${o?`<circle cx="${a+2}" cy="${n-1.3}" r=".9" fill="#fff"/>`:`<path d="M${a+.8} ${n-2.5} l2.4 2.4 m0 -2.4 l-2.4 2.4" stroke="#fff" stroke-width="1"/>`}`,he=(a=!0)=>`
  <path d="M-17 1 L-27 -3 L-25 3 L-17 8Z" fill="${$}"/>
  <path d="M-4 13 L-1 17" stroke="${$}" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M1 12 V26 M-3 26.5 H7" stroke="${$}" stroke-width="2.6" stroke-linecap="round" fill="none"/>
  <ellipse cx="-3" cy="4" rx="16" ry="10.5" fill="${wt}"/>
  <ellipse cx="1" cy="9" rx="10" ry="4.5" fill="${vt}"/>
  <path d="M-15 -1 Q-1 -7 9 2 Q-1 11 -15 7Z" fill="${st}"/>
  <path d="M-12 1 Q-4 -1 3 3 M-12 4 Q-5 3 1 5" stroke="${fe}" stroke-width="1" fill="none"/>
  <path d="M7 -1 Q10 -14 13.5 -22 L18.5 -21 Q15 -12 14 3Z" fill="${$}"/>
  ${lt(17,-24,a)}`,_t={stand:he(),waddle:`<g class="gw-body">
    <path d="M-17 1 L-27 -3 L-25 3 L-17 8Z" fill="${$}"/>
    <path class="gw-leg-a" d="M-4 12 V26 M-8 26.5 H1" stroke="${$}" stroke-width="2.6" stroke-linecap="round" fill="none"/>
    <path class="gw-leg-b" d="M4 12 V26 M0 26.5 H9" stroke="${$}" stroke-width="2.6" stroke-linecap="round" fill="none"/>
    <ellipse cx="-3" cy="4" rx="16" ry="10.5" fill="${wt}"/>
    <ellipse cx="1" cy="9" rx="10" ry="4.5" fill="${vt}"/>
    <path d="M-15 -1 Q-1 -7 9 2 Q-1 11 -15 7Z" fill="${st}"/>
    <path d="M7 -1 Q10 -14 13.5 -22 L18.5 -21 Q15 -12 14 3Z" fill="${$}"/>
    ${lt(17,-24)}</g>`,drive:`<g class="gd-car">
    <path d="M-31 4 H-25 M-30 9 H-26" stroke="#f3ead2" stroke-width="1.6" stroke-linecap="round" opacity=".75"/>
    <path d="M-2 0 Q-1 -12 1 -18 L6 -17 Q4 -10 4 0Z" fill="${$}"/>
    ${lt(4,-20)}
    <path d="M-23 14 Q-24 4 -16 3 L-10 3 Q-6 -5 4 -5 L10 -5 Q15 -5 18 3 L22 4 Q26 6 25 14Z" fill="#006bb7" stroke="${$}" stroke-width="1.2"/>
    <path d="M-8 3 Q-5 -2 -3 -2 L-3 3Z M6 -2 L9 -2 Q12 -2 14 3 L6 3Z" fill="#cfe6f5"/>
    <circle cx="24" cy="8" r="1.6" fill="#ffe58a"/>
    <circle cx="-13" cy="15" r="5.5" fill="${$}"/><circle cx="-13" cy="15" r="2" fill="#c9c2b0"/>
    <circle cx="14" cy="15" r="5.5" fill="${$}"/><circle cx="14" cy="15" r="2" fill="#c9c2b0"/></g>`,fly:`
    <path d="M-18 -1 L-28 -4 L-27 3Z" fill="${$}"/>
    <path class="gf-far" d="M-6 0 Q-2 14 10 20 Q6 8 6 1Z" fill="#4a3725"/>
    <ellipse cx="-3" cy="0" rx="16" ry="6.5" fill="${wt}"/>
    <ellipse cx="-1" cy="3" rx="10" ry="3" fill="${vt}"/>
    <path d="M8 -3 Q15 -5 19 -5 L20 0 Q14 0 8 3Z" fill="${$}"/>
    ${lt(22,-3)}
    <path class="gf-wing" d="M-8 -3 Q-6 -22 6 -30 Q8 -16 8 -3Z" fill="${st}"/>
    <path class="gf-wing" d="M-4 -6 Q-1 -16 4 -22" stroke="${fe}" stroke-width="1" fill="none"/>`,carried:`<g class="gc-all">
    <path d="M-4 17 L-5 27 M4 17 L5 27 M-8 27.5 H-2 M2 27.5 H8" stroke="${$}" stroke-width="2.4" stroke-linecap="round"/>
    <path class="gc-wl" d="M-5 -2 Q-22 -6 -30 -24 Q-18 -20 -8 -12 Q-20 -12 -26 -4 Q-14 -2 -6 6Z" fill="${st}"/>
    <path class="gc-wr" d="M5 -2 Q22 -6 30 -24 Q18 -20 8 -12 Q20 -12 26 -4 Q14 -2 6 6Z" fill="${st}"/>
    <ellipse cx="0" cy="6" rx="10" ry="13" fill="${wt}"/>
    <ellipse cx="1" cy="10" rx="6" ry="7" fill="${vt}"/>
    <path d="M-2 -5 Q-2 -15 1 -21 L6 -20 Q3 -13 3 -4Z" fill="${$}"/>
    ${lt(4,-23)}</g>`,fainted:`<ellipse cx="0" cy="-26" rx="10" ry="3" fill="none" stroke="#ffd34d" stroke-width="2"/>
    <g transform="translate(0 2) rotate(160)" opacity=".8">${he(!1)}</g>`},dt=(a,n="")=>`<svg class="${n}" viewBox="-34 -34 68 68" overflow="visible" aria-hidden="true">${_t[a]}</svg>`;var me=111320*Math.cos(43.43*Math.PI/180),D=([a,n])=>({x:(a- -80.45)*me,y:(43.43-n)*110574}),Rt=({x:a,y:n})=>[a/me+-80.45,43.43-n/110574],T=(a,n)=>Math.hypot(a.x-n.x,a.y-n.y);function ct(a){let n={minX:1/0,minY:1/0,maxX:-1/0,maxY:-1/0};for(let o of a)o.x<n.minX&&(n.minX=o.x),o.y<n.minY&&(n.minY=o.y),o.x>n.maxX&&(n.maxX=o.x),o.y>n.maxY&&(n.maxY=o.y);return n}var $t=(a,n,o=0)=>a.x>=n.minX-o&&a.x<=n.maxX+o&&a.y>=n.minY-o&&a.y<=n.maxY+o;function Zt(a,n){let o=!1;for(let r=0,p=n.length-1;r<n.length;p=r++){let m=n[r],g=n[p];m.y>a.y!=g.y>a.y&&a.x<(g.x-m.x)*(a.y-m.y)/(g.y-m.y)+m.x&&(o=!o)}return o}function Mt(a,n){let o={d:1/0,at:n[0],seg:0};for(let r=0;r<n.length-1;r++){let p=n[r],m=n[r+1],g=m.x-p.x,l=m.y-p.y,u=g*g+l*l||1,v=Math.max(0,Math.min(1,((a.x-p.x)*g+(a.y-p.y)*l)/u)),y={x:p.x+v*g,y:p.y+v*l},M=T(a,y);M<o.d&&(o={d:M,at:y,seg:r})}return o}function Lt(a){let n=0,o=0,r=0;for(let p=0,m=a.length-1;p<a.length;m=p++){let g=a[m].x*a[p].y-a[p].x*a[m].y;n+=g,o+=(a[m].x+a[p].x)*g,r+=(a[m].y+a[p].y)*g}return n?{x:o/(3*n),y:r/(3*n)}:a[0]}var kt=class{constructor(n,o=500){this.size=o;this.cells=new Map;this.key=(n,o)=>`${n},${o}`;for(let r of n){let p=this.key(Math.floor(r.p.x/o),Math.floor(r.p.y/o));(this.cells.get(p)??this.cells.set(p,[]).get(p)).push(r)}}near(n,o){let r=[],p=Math.ceil(o/this.size),m=Math.floor(n.x/this.size),g=Math.floor(n.y/this.size);for(let l=m-p;l<=m+p;l++)for(let u=g-p;u<=g+p;u++)for(let v of this.cells.get(this.key(l,u))??[]){let y=T(n,v.p);y<=o&&r.push({item:v,d:y})}return r.sort((l,u)=>l.d-u.d)}},I=(a,n=!1)=>a.map((o,r)=>`${r?"L":"M"}${o.x.toFixed(0)} ${o.y.toFixed(0)}`).join("")+(n?"Z":"");function xe(a){let n=g=>g.map(D),o=a.cities.map(g=>{let l=n(g.ring);return{...g,ring:l,bbox:ct(l)}}),r=a.territories.map(g=>{let l=n(g.ring);return{...g,ring:l,bbox:ct(l),center:Lt(l)}}),p=a.streets.map(g=>{let l=n(g.line);return{...g,line:l,bbox:ct(l)}}),m=[...a.landmarks.map(g=>({name:g.name,kind:g.kind,p:D(g.at)})),...a.ion.stations.map(g=>({name:g.name.endsWith("Station")?g.name:`${g.name} Station`,kind:"ion",p:D(g.at)})),...a.busStops.map(g=>({name:g.name,kind:"bus",p:D(g.at)}))];return{cities:o,territories:r,streets:p,ionLine:n(a.ion.line),places:m,bbox:ct(o.flatMap(g=>g.ring)),attribution:a.meta.attribution}}var Q=250;function Dt(a,n){let o=a.cities.find(m=>m.id===n),r=a.territories.filter(m=>m.city===n),p=r.reduce((m,g)=>T(g.center,Lt(o.ring))<T(m,Lt(o.ring))?g.center:m,r[0].center);return{kind:"city",id:n,name:o.name,bbox:o.bbox,spawn:p,contains:m=>$t(m,o.bbox)&&Zt(m,o.ring)}}function be(a,n){let o=a.streets.find(r=>r.id===n);return{kind:"street",id:n,name:o.name,bbox:o.bbox,spawn:o.line[Math.floor(o.line.length/2)],contains:r=>$t(r,o.bbox,Q)&&Mt(r,o.line).d<=Q}}function ye(a,n){for(let o of a.territories)if($t(n,o.bbox)&&Zt(n,o.ring))return o;return null}var ue=a=>a<3?"stand":a<15?"waddle":a<150?"drive":"fly",St=class a{constructor(n=!0){this.smoothing=n;this.raw=[];this.smoothed=[];this.motion="stand";this.pending={m:"stand",n:0}}snapshot(){return{smoothing:this.smoothing,raw:this.raw,smoothed:this.smoothed,motion:this.motion,pending:this.pending}}static restore(n){let o=new a(n.smoothing);return Object.assign(o,{raw:n.raw,smoothed:n.smoothed,motion:n.motion,pending:n.pending}),o}reset(n,o){this.raw=[{p:n,t:o}],this.smoothed=[{p:n,t:o}],this.motion="stand",this.pending={m:"stand",n:0}}push(n){if(this.raw.push(n),this.raw.length>6&&this.raw.shift(),!this.smoothing){let v=this.raw[this.raw.length-2]??n,y=T(v.p,n.p)/Math.max(1e-6,n.t-v.t)*3.6;return this.motion=ue(y),this.smoothed=[n],{p:n.p,kmh:y,motion:this.motion}}let o=this.raw.slice(-3),r=v=>o.map(y=>y.p[v]).sort((y,M)=>y-M)[Math.floor(o.length/2)],p=this.smoothed[this.smoothed.length-1]??n,m={x:p.p.x+.55*(r("x")-p.p.x),y:p.p.y+.55*(r("y")-p.p.y)};this.smoothed.push({p:m,t:n.t}),this.smoothed.length>5&&this.smoothed.shift();let g=this.smoothed[0],l=T(g.p,m)/Math.max(1e-6,n.t-g.t)*3.6,u=ue(l);return u===this.motion?this.pending={m:u,n:0}:u===this.pending.m&&++this.pending.n>=3?(this.motion=u,this.pending={m:u,n:0}):u!==this.pending.m&&(this.pending={m:u,n:1}),{p:m,kmh:l,motion:this.motion}}};var zt=60,jt=.2,we=8,Ke=.07,Ft=4,Ue=5,Je=10,Et=3,ve=600,Qt={walk:5,drive:60,fly:260},ke={stand:"Standing",waddle:"Waddling",drive:"Driving",fly:"Flying",carried:"Picked up",fainted:"Fainted"},ta={ion:["#006bb7","I"],bus:["#3b8f6a","B"],campus:["#7b5cc4","U"],park:["#4c9a3f","P"],shop:["#c27a2c","S"],civic:["#5f6f8a","C"],plaza:["#b8485a","\u2605"],transit:["#006bb7","T"],airport:["#3f6fb8","\u2708"]},_={zone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/></svg>',help:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="9.5"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01"/></svg>',layers:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/></svg>',plus:'<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',minus:'<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 12h14"/></svg>',fit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',close:'<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'};var Me="goose-turf:v1",$e="goose-turf:intro-dismissed";function Le(a,n,o={}){oa();let r=xe(n),p=ia(),m=p?.visits??{},g=new Set(p?.claimed??[]),l=Jt(p?.zone??{kind:"city",id:"waterloo"}),u={...l.spawn},v={...u},y={...u},M=new St(!0),O=8*3600;M.reset(u,O);let Wt=0,Yt="stand",A="stand",U=1,X=100,J=0,tt=!0,j=!1,G=null,et=null,at=0,gt=0,At=0,Vt=0,Y=!1,F=!1,B=!0,C=[],Z=0,z=new Set,W=[],nt=[],Se=new kt(r.places,500),Gt=[],pt=[],ht=o.apiBase?"connecting":"";a.innerHTML=sa(r);let h=t=>a.querySelector(`[data-ref="${t}"]`),ft=h("gt"),k=h("svg");Ye();let Tt=h("goose"),V=h("gooseArt"),mt=h("bubble"),qt=new Map;a.querySelectorAll("[data-badge]").forEach(t=>qt.set(t.dataset.badge,t));let it=new Map;a.querySelectorAll("[data-terr]").forEach(t=>it.set(t.dataset.terr,t));let ze=Array.from(a.querySelectorAll("[data-at]")),w={x:0,y:0,w:1,h:1},Xt=()=>Math.min(k.clientWidth/w.w,k.clientHeight/w.h)||.03;function ot(t){w=t,k.setAttribute("viewBox",`${t.x} ${t.y} ${t.w} ${t.h}`);let e=1/Xt();for(let c of ze)c.setAttribute("transform",`translate(${c.dataset.at}) scale(${e})`);let i=h("hatch");i.setAttribute("width",String(10*e)),i.setAttribute("height",String(10*e)),h("hatchBar").setAttribute("width",String(4*e)),h("hatchBar").setAttribute("height",String(10*e));let s=h("shadow");s.setAttribute("dy",String(6*e)),s.setAttribute("stdDeviation",String(2*e));let d=e;ft.classList.toggle("z-far",d<55),ft.classList.toggle("z-mid",d<14),ft.classList.toggle("z-near",d<6)}function Bt(t){let e=k.clientWidth||1200,i=k.clientHeight||800,d=e>860?{l:60,r:280,t:80,b:120}:{l:20,r:20,t:150,b:260},c=Math.max(100,e-d.l-d.r),x=Math.max(100,i-d.t-d.b),b=Math.max((t.maxX-t.minX)/c,(t.maxY-t.minY)/x),S=(t.minX+t.maxX)/2,f=(t.minY+t.maxY)/2,L=S-(d.l+c/2)*b,H=f-(d.t+x/2)*b;ot({x:L,y:H,w:e*b,h:i*b})}function rt(t,e,i){let s=Kt(e,i),d=Math.min(9e4,Math.max(600,w.w*t)),c=w.h*(d/w.w);ot({x:s.x-(s.x-w.x)*(d/w.w),y:s.y-(s.y-w.y)*(c/w.h),w:d,h:c})}function Kt(t,e){let i=k.getScreenCTM();if(!i)return{x:0,y:0};let s=new DOMPoint(t,e).matrixTransform(i.inverse());return{x:s.x,y:s.y}}function Ee(t){let e=k.getScreenCTM(),i=a.getBoundingClientRect();if(!e)return{x:0,y:0};let s=new DOMPoint(t.x,t.y).matrixTransform(e);return{x:s.x-i.left,y:s.y-i.top}}function Ye(){let t=h("terr"),e=h("badges"),i=h("labels"),s="",d="",c="";for(let f of r.territories){let L=r.cities.find(H=>H.id===f.city);s+=`<path class="gt-terr" data-terr="${f.id}" fill="${L.color}" vector-effect="non-scaling-stroke" d="${I(f.ring,!0)}"/>`,s+=`<path class="gt-terr-shine" vector-effect="non-scaling-stroke" d="${I(f.ring,!0)}" transform="translate(0 -40)"/>`,d+=`<g class="gt-badge" data-badge="${f.id}" data-at="${f.center.x} ${f.center.y}"><circle r="13" stroke="${L.color}"/><text>0</text></g>`,c+=`<g data-at="${f.center.x} ${f.center.y}"><text class="gt-label gt-terr-label" y="27" text-anchor="middle">${R(f.name)}</text></g>`}for(let f of r.cities){s+=`<path class="gt-city-edge" vector-effect="non-scaling-stroke" d="${I(f.ring,!0)}"/>`;let L=f.bbox,H=(L.minY+L.maxY)/2,[K,Ne,_e,Re,Ze]=f.id==="cambridge"?[L.maxX,H,"start",14,0]:[L.minX,H,"end",-14,0];c+=`<g data-at="${K} ${Ne}"><text class="gt-label gt-city-label" x="${Re}" y="${Ze}" text-anchor="${_e}">${R(f.name)}</text></g>`}for(let[f,L,H]of[["Woolwich",43.565,-80.5],["Wilmot",43.37,-80.62],["North Dumfries",43.315,-80.4]]){let K=D([H,L]);c+=`<g data-at="${K.x} ${K.y}"><text class="gt-label gt-township" text-anchor="middle">${f}</text></g>`}t.innerHTML=s,h("streets").innerHTML=r.streets.map(f=>`<path class="gt-street" data-street="${f.id}" vector-effect="non-scaling-stroke" d="${I(f.line)}"/>`).join(""),h("ion").innerHTML=`<path class="gt-ion-casing" vector-effect="non-scaling-stroke" d="${I(r.ionLine)}"/>
      <path class="gt-ion" vector-effect="non-scaling-stroke" d="${I(r.ionLine)}"/>`+r.places.filter(f=>f.kind==="ion").map(f=>`<g data-at="${f.p.x} ${f.p.y}"><circle class="gt-station" r="5"/><text class="gt-label gt-station-label" x="9" y="4">${R(f.name.replace(" Station",""))}</text></g>`).join(""),h("stops").setAttribute("d",r.places.filter(f=>f.kind==="bus").map(f=>`M${(f.p.x-18).toFixed(0)} ${f.p.y.toFixed(0)}a18 18 0 1 0 36 0a18 18 0 1 0 -36 0`).join("")),h("region").setAttribute("d",Ae()),e.innerHTML=d,i.innerHTML=c;let x=r.bbox,b=5e3,S=[];for(let f=Math.floor((x.minX-4e4)/b)*b;f<x.maxX+4e4;f+=b)S.push(`M${f} ${x.minY-4e4}V${x.maxY+4e4}`);for(let f=Math.floor((x.minY-4e4)/b)*b;f<x.maxY+4e4;f+=b)S.push(`M${x.minX-4e4} ${f}H${x.maxX+4e4}`);h("grid").setAttribute("d",S.join(""))}function Ae(){let t=r.places.filter(s=>s.kind==="bus").map(s=>s.p),e=ra(t),i=e.reduce((s,d)=>({x:s.x+d.x/e.length,y:s.y+d.y/e.length}),{x:0,y:0});return I(e.map(s=>({x:i.x+(s.x-i.x)*1.16,y:i.y+(s.y-i.y)*1.16})),!0)}function Ut(){let t=h("zoneFill"),e=h("zoneLine"),i=h("maskShape");if(a.querySelectorAll(".gt-street.is-zone").forEach(d=>d.classList.remove("is-zone")),l.kind==="city"){let d=r.cities.find(x=>x.id===l.id),c=I(d.ring,!0);t.setAttribute("d",c),e.setAttribute("d",""),i.setAttribute("d",c),i.setAttribute("fill","#000"),i.removeAttribute("stroke")}else{let d=r.streets.find(x=>x.id===l.id),c=I(d.line);t.setAttribute("d",""),e.setAttribute("d",c),e.setAttribute("stroke-width",String(Q*2)),i.setAttribute("d",c),i.setAttribute("fill","none"),i.setAttribute("stroke","#000"),i.setAttribute("stroke-width",String(Q*2)),i.setAttribute("stroke-linecap","round"),a.querySelector(`[data-street="${d.id}"]`)?.classList.add("is-zone")}let s=h("zoneSwatch");s.style.background=l.kind==="city"?r.cities.find(d=>d.id===l.id).color:"var(--gt-gold)",h("zoneName").textContent=l.name,h("zoneKind").textContent=l.kind==="city"?"Stay inside the city":`Stay within ${Q} m of the street`}function Jt(t){try{return t.kind==="city"?Dt(r,t.id):be(r,t.id)}catch{return Dt(r,"waterloo")}}function Ge(t){l=Jt(t),Ut(),te(!1),Bt(l.bbox),P(`Home zone set to ${l.name}`,"zone"),Ot()}function te(t=!0){u={...l.spawn},v={...u},y={...u},M.reset(u,O),X=100,J=0,j=!1,G=null,et=null,gt=0,C=[],Z=0,B=!0,h("faint").classList.remove("show"),t&&(P(`Goose respawned in ${l.name}`,"zone"),q("I'm back!")),N()}function Te(){let t=[],e=s=>{for(let d=0;d<3;d++){let c=Math.random()*Math.PI*2;t.push({to:{x:s.x+Math.cos(c)*140,y:s.y+Math.sin(c)*140},kmh:5})}},i=(s,d)=>{let c=Math.hypot(d.x,d.y)||1,x={x:s.x+d.x/c*3500,y:s.y+d.y/c*3500};t.push({to:x,kmh:260},{wait:5.5},{to:s,kmh:260},{wait:1})};if(l.kind==="city"){let s=r.territories.filter(b=>b.city===l.id),d=[],c=u,x=[...s];for(;x.length;){x.sort((S,f)=>T(c,S.center)-T(c,f.center));let b=x.shift();d.push(b),c=b.center}d.forEach((b,S)=>{if(t.push({to:b.center,kmh:50},{wait:2}),e(b.center),t.push({wait:1.5}),S===Math.floor(d.length/2)){let f=r.cities.find(K=>K.id===l.id),L={x:(f.bbox.minX+f.bbox.maxX)/2,y:(f.bbox.minY+f.bbox.maxY)/2},H={x:b.center.x-L.x,y:b.center.y-L.y};i(b.center,H)}})}else{let s=r.streets.find(S=>S.id===l.id),d=Mt(u,s.line),c=d.seg<s.line.length/2?s.line.slice(d.seg):s.line.slice(0,d.seg+2).reverse();t.push({to:c[0],kmh:40}),c.forEach((S,f)=>{t.push({to:S,kmh:55}),f===Math.floor(c.length/3)&&(t.push({wait:2}),e(S),t.push({to:S,kmh:5},{wait:1}))});let x=c[c.length-1],b=c[c.length-2]??c[0];t.push({wait:2}),i(x,{x:-(x.y-b.y),y:x.x-b.x})}return t}function Xe(t){if(Z>0)return Z-=t,null;C.length||(C=Te());let e=C[0];if("wait"in e)return Z=e.wait,C.shift(),null;let i=e.kmh/3.6*zt*t,s=T(u,e.to);return s<=i?(C.shift(),{...e.to}):{x:u.x+(e.to.x-u.x)/s*i,y:u.y+(e.to.y-u.y)/s*i}}function ee(){return Math.sqrt(-2*Math.log(Math.random()||1e-9))*Math.cos(2*Math.PI*Math.random())}function Be(){let t=u;if(!Y&&(t={x:t.x+ee()*we,y:t.y+ee()*we},Math.random()<Ke)){let x=Math.random()*Math.PI*2,b=40+Math.random()*60;t={x:t.x+Math.cos(x)*b,y:t.y+Math.sin(x)*b}}let e=M.push({p:t,t:O});y=e.p,Wt=e.kmh,e.motion!==Yt&&(Yt=e.motion,W.push(performance.now()));let[i,s]=Rt(t);o.apiBase&&pt.push({lat:s,lon:i,t:Math.round(O)});let d=ye(r,y);d?.id!==G?.id?M.smoothing?(d?.id===et?.id?at++:(et=d,at=1),at>=2&&ae(d)):ae(d):(et=null,at=0);let c=l.contains(y);c!==tt&&(tt=c,P(c?`Back inside ${l.name}`:`Left ${l.name}`,c?"zone":"warn"),c||q("Uh oh")),Gt=Se.near(y,ve).slice(0,7)}function ae(t){G&&(P(`Exited ${G.name}`,"exit"),it.get(G.id)?.classList.remove("is-here")),G=t,gt=0,et=null,at=0,W.push(performance.now()),t&&(m[t.id]=(m[t.id]??0)+1,P(`Entered ${t.name}`,"enter"),it.get(t.id)?.classList.add("is-here"),Ct(t.id,!0),q("HONK!"),Ot())}function Ce(t){g.add(t.id),it.get(t.id)?.classList.add("is-claimed"),Ct(t.id,!0),P(`Claimed ${t.name} (stayed ${Et} min)`,"claim"),q("Mine!"),ie(),Ot()}function Ct(t,e=!1){let i=qt.get(t);if(!i)return;i.querySelector("text").textContent=String(m[t]??0),i.classList.toggle("is-claimed",g.has(t));let s=r.cities.find(d=>d.id===r.territories.find(c=>c.id===t).city);i.querySelector("circle").setAttribute("fill",g.has(t)?s.color:""),e&&(i.classList.remove("pop"),i.getBoundingClientRect(),i.classList.add("pop"))}function Pe(){j=!0,B=!1,C=[],P("Goose fainted outside the zone","warn"),h("faintZone").textContent=l.name,h("faint").classList.add("show"),N()}async function He(){if(!o.apiBase||!pt.length)return;let t=pt.splice(0,pt.length);try{let i=await(await fetch(`${o.apiBase}/v1/track`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({deviceId:o.deviceId??"goose-1",zone:{kind:l.kind,id:l.id},fixes:t})})).json();ht=`server ok, ${i.latencyMs??"?"} ms`;for(let s of i.events??[])P(`${s.type.replace("_"," ")} ${s.territoryName??s.zone??""}`,"server")}catch{ht="server unreachable"}}o.apiBase&&setInterval(He,1e3);let ne=t=>{let e=Math.floor(t/60)%1440;return`${String(Math.floor(e/60)).padStart(2,"0")}:${String(e%60).padStart(2,"0")}`};function P(t,e){nt.unshift({at:ne(O),text:t,tag:e}),nt.length>40&&nt.pop(),ut==="events"&&xt()}let Pt=0;function q(t){mt.querySelector("text").textContent=t;let e=Math.max(54,t.length*9+22),i=mt.querySelector("rect");i.setAttribute("x",String(-e/2)),i.setAttribute("width",String(e)),mt.style.opacity="1",Pt=1.3}let ut="nearby";function xt(){let t=h("list");ut==="nearby"?t.innerHTML=Gt.length?Gt.map(({item:e,d:i})=>{let[s,d]=ta[e.kind]??["#666","\u2022"],c=Math.atan2(e.p.y-y.y,e.p.x-y.x)*(180/Math.PI)+90;return`<li><span class="gt-ico" style="background:${s}">${d}</span><span>${R(e.name)}</span>
          <span class="gt-dist"><span class="gt-arrow" style="transform:rotate(${c.toFixed(0)}deg)">\u2191</span>${na(i)}</span></li>`}).join(""):`<li class="gt-empty">Nothing within ${ve} m. Open field, good grazing.</li>`:t.innerHTML=nt.length?nt.slice(0,18).map(e=>`<li><span class="gt-ico" style="background:${ea[e.tag]??"#555"}">${aa[e.tag]??"\u2022"}</span><span>${R(e.text)}</span><span class="gt-dist">${e.at}</span></li>`).join(""):'<li class="gt-empty">No events yet. Move the goose across a border.</li>'}function ie(){h("cities").innerHTML=r.cities.map(t=>{let e=r.territories.filter(s=>s.city===t.id),i=e.filter(s=>g.has(s.id)).length;return`<div class="gt-panel gt-city"><span class="gt-swatch" style="background:${t.color}"></span><b>${t.name}</b>
        <span class="gt-count">${i}/${e.length}</span><span class="gt-bar"><i style="width:${i/e.length*100}%"></i></span></div>`}).join("")}let oe=null;function Ie(){let t=Ee(v),[e,i]=Rt(y);h("speed").textContent=String(Math.round(Wt)),h("motion").textContent=ke[A],h("latlon").textContent=`${i.toFixed(5)}, ${e.toFixed(5)}`,h("screen").textContent=`${Math.round(t.x)}, ${Math.round(t.y)} px`,h("terrName").textContent=G?G.name:tt?"Between neighbourhoods":"Outside the cities",h("clock").textContent=ne(O),ht&&(h("server").textContent=ht);let s=h("healthFill");s.style.width=`${X}%`,s.style.backgroundColor=X>60?"var(--gt-good)":X>30?"var(--gt-warn)":"var(--gt-bad)",h("healthNum").textContent=`${Math.ceil(X)} HP`,h("banner").textContent=ke[A],oe!==A&&(h("avatar").innerHTML=dt(A),oe=A);let d=performance.now();for(;W.length&&d-W[0]>6e4;)W.shift();h("flips").textContent=String(W.length);let c=h("warn");if(!tt&&!j){c.classList.add("show");let x=Math.ceil(Ft-J);c.textContent=x>0?`Outside ${l.name}! Health drains in ${x}s`:`Goose is weakening. Get back to ${l.name}!`}else c.classList.remove("show");ut==="nearby"&&xt()}function N(){h("autoBtn").setAttribute("aria-pressed",String(B)),h("autoSub").textContent=B?"Goose tours your zone":"Drag the goose or use the arrow keys",h("smoothBtn").setAttribute("aria-pressed",String(M.smoothing)),h("smoothSub").textContent=M.smoothing?"On: median + moving-average filter":"Off: raw fixes, watch Gus twitch",h("followBtn").setAttribute("aria-pressed",String(F))}let re=performance.now();function se(t){let e=Math.min(.05,(t-re)/1e3);if(re=t,!j){O+=e*zt;let c=null,x=(z.has("ArrowRight")||z.has("d")?1:0)-(z.has("ArrowLeft")||z.has("a")?1:0),b=(z.has("ArrowDown")||z.has("s")?1:0)-(z.has("ArrowUp")||z.has("w")?1:0);if(!Y&&(x||b)){let f=(z.has(" ")?Qt.fly:z.has("Shift")?Qt.drive:Qt.walk)/3.6*zt*e,L=Math.hypot(x,b);c={x:u.x+x/L*f,y:u.y+b/L*f}}else B&&!Y&&(c=Xe(e));for(c&&(Math.abs(c.x-u.x)>.01&&(U=c.x<u.x?-1:1),u=c),At+=e;At>=jt;)At-=jt,Be();tt?(J=0,X=Math.min(100,X+Je*e)):(J+=e,J>Ft&&(X-=Ue*e)),X<=0&&(X=0,Pe()),G&&(gt+=e,gt>=Et&&!g.has(G.id)&&Ce(G))}A=j?"fainted":Y?"carried":Yt;let i=Y?u:y,s=Y||!M.smoothing?1:1-Math.exp(-e*10);v={x:v.x+(i.x-v.x)*s,y:v.y+(i.y-v.y)*s};let d=1/Xt();if(Tt.setAttribute("transform",`translate(${v.x} ${v.y}) scale(${d*.95})`),(V.dataset.state!==A||V.dataset.facing!==String(U))&&(V.dataset.state=A,V.dataset.facing=String(U),V.innerHTML=_t[A],V.setAttribute("transform",`scale(${A==="fainted"||A==="carried"?1:U} 1)`)),Tt.classList.toggle("is-carried",Y),Pt>0&&(Pt-=e)<=0&&(mt.style.opacity="0"),F&&!Y){let c=w.x+w.w/2,x=w.y+w.h/2,b=1-Math.exp(-e*3);ot({...w,x:w.x+(v.x-c)*b,y:w.y+(v.y-x)*b})}(Vt+=e)>.1&&(Vt=0,Ie()),requestAnimationFrame(se)}let E=new Map,bt=null,yt=0;Tt.addEventListener("pointerdown",t=>{j||(t.stopPropagation(),Y=!0,B=!1,C=[],Z=0,k.setPointerCapture(t.pointerId),E.set(t.pointerId,{x:t.clientX,y:t.clientY}),q("Put me down!"),N())}),k.addEventListener("pointerdown",t=>{if(E.set(t.pointerId,{x:t.clientX,y:t.clientY}),k.setPointerCapture(t.pointerId),E.size===1&&(bt={x:t.clientX,y:t.clientY,view:{...w}},k.classList.add("is-panning")),E.size===2){let[e,i]=[...E.values()];yt=Math.hypot(e.x-i.x,e.y-i.y),bt=null}}),k.addEventListener("pointermove",t=>{if(!E.has(t.pointerId))return;let e=E.get(t.pointerId);if(E.set(t.pointerId,{x:t.clientX,y:t.clientY}),Y){let i=Kt(t.clientX,t.clientY);Math.abs(i.x-u.x)>1&&(U=i.x<u.x?-1:1),u=i;return}if(E.size===2){let[i,s]=[...E.values()],d=Math.hypot(i.x-s.x,i.y-s.y);yt&&rt(yt/d,(i.x+s.x)/2,(i.y+s.y)/2),yt=d;return}if(bt){let i=1/Xt();ot({...w,x:w.x-(t.clientX-e.x)*i,y:w.y-(t.clientY-e.y)*i})}});let le=t=>{E.delete(t.pointerId),Y&&!E.size&&(Y=!1,M.reset(u,O),y={...u}),E.size||(bt=null,k.classList.remove("is-panning"))};k.addEventListener("pointerup",le),k.addEventListener("pointercancel",le),k.addEventListener("wheel",t=>{t.preventDefault(),rt(Math.exp(t.deltaY*.0015),t.clientX,t.clientY)},{passive:!1});let de=t=>e=>{let i=e.key.length===1?e.key.toLowerCase():e.key;["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","w","a","s","d"," ","Shift"].includes(i)&&(e.target?.closest?.("button")&&i===" "||((i.startsWith("Arrow")||i===" ")&&e.preventDefault(),t?z.add(i):z.delete(i),t&&["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","w","a","s","d"].includes(i)&&B&&(B=!1,C=[],Z=0,N())))};window.addEventListener("keydown",de(!0)),window.addEventListener("keydown",t=>{t.key==="Escape"&&ge()}),window.addEventListener("keyup",de(!1)),window.addEventListener("blur",()=>z.clear()),window.addEventListener("resize",()=>ot(w)),a.addEventListener("click",t=>{let e=t.target.closest("[data-act]");if(!e)return;let i=e.dataset.act;i==="zone"&&(ce(It),h("picker").classList.add("show")),i==="help"&&h("about").classList.add("show"),i==="layers"&&h("layers").classList.toggle("show"),i==="close"&&e.closest(".gt-modal")?.classList.remove("show"),i==="introClose"&&ge(),i==="pickTab"&&(It=e.dataset.tab,ce(It)),i==="pick"&&(Ge({kind:e.dataset.kind,id:e.dataset.id}),h("picker").classList.remove("show")),i==="auto"&&(B=!B,C=[],Z=0,N()),i==="smooth"&&(M.smoothing=!M.smoothing,M.reset(y,O),P(`GPS smoothing ${M.smoothing?"on":"off"}`,"zone"),N()),i==="follow"&&(F=!F,F&&w.w>9e3&&rt(6e3/w.w,...Ht()),N()),i==="zin"&&rt(.7,...Ht()),i==="zout"&&rt(1.4,...Ht()),i==="fit"&&(F=!1,Bt(l.bbox),N()),i==="respawn"&&te(),i==="tab"&&(ut=e.dataset.tab,a.querySelectorAll("[data-act=tab]").forEach(s=>s.setAttribute("aria-selected",String(s===e))),xt())}),a.addEventListener("change",t=>{let e=t.target;e.dataset.layer&&ft.classList.toggle(`gt-hide-${e.dataset.layer}`,!e.checked)});let Ht=()=>{let t=k.getBoundingClientRect();return[t.left+t.width/2,t.top+t.height/2]},It=l.kind;function ce(t){a.querySelectorAll("[data-act=pickTab]").forEach(e=>e.setAttribute("aria-selected",String(e.dataset.tab===t))),h("picks").innerHTML=t==="city"?r.cities.map(e=>{let i=r.territories.filter(s=>s.city===e.id).length;return`<button class="gt-pick" data-act="pick" data-kind="city" data-id="${e.id}" aria-current="${l.kind==="city"&&l.id===e.id}">
          <span class="gt-swatch" style="background:${e.color}"></span><b>${e.name}</b><small>${i} neighbourhoods to claim</small></button>`}).join(""):r.streets.map(e=>`<button class="gt-pick" data-act="pick" data-kind="street" data-id="${e.id}" aria-current="${l.kind==="street"&&l.id===e.id}">
          <span class="gt-swatch" style="background:var(--gt-gold)"></span><b>${R(e.name)}</b><small>${R(e.desc)}</small></button>`).join("")}function Oe(){let t=!1;try{t=localStorage.getItem($e)==="1"}catch{}t||h("intro").classList.add("show")}function ge(){let t=h("intro");if(t.classList.contains("show")){t.classList.remove("show");try{localStorage.setItem($e,"1")}catch{}}}function Ot(){try{localStorage.setItem(Me,JSON.stringify({claimed:[...g],visits:m,zone:{kind:l.kind,id:l.id}}))}catch{}}for(let t of r.territories)Ct(t.id),g.has(t.id)&&it.get(t.id)?.classList.add("is-claimed");Ut(),ie(),N(),xt(),Oe(),requestAnimationFrame(()=>{Bt(k.clientWidth>1100?r.bbox:l.bbox),P(`Goose landed in ${l.name}`,"zone"),q("HONK!"),requestAnimationFrame(se)})}var ea={enter:"#4c9a3f",exit:"#7a6a58",claim:"#c99a1f",warn:"#e5533d",zone:"#006bb7",server:"#7b5cc4"},aa={enter:"\u2192",exit:"\u2190",claim:"\u2605",warn:"!",zone:"\u25CE",server:"S"},R=a=>a.replace(/[&<>"]/g,n=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[n]),na=a=>a<1e3?`${Math.round(a/10)*10} m`:`${(a/1e3).toFixed(1)} km`;function ia(){try{let a=localStorage.getItem(Me);return a?JSON.parse(a):null}catch{return null}}function oa(){if(!document.getElementById("gt-style")){let a=document.createElement("style");a.id="gt-style",a.textContent=pe,document.head.appendChild(a)}if(!document.getElementById("gt-fonts")){let a=document.createElement("link");a.id="gt-fonts",a.rel="stylesheet",a.href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Nunito:wght@600;700;800;900&display=swap",document.head.appendChild(a)}}function ra(a){let n=[...a].sort((m,g)=>m.x-g.x||m.y-g.y),o=(m,g,l)=>(g.x-m.x)*(l.y-m.y)-(g.y-m.y)*(l.x-m.x),r=[],p=[];for(let m of n){for(;r.length>=2&&o(r[r.length-2],r[r.length-1],m)<=0;)r.pop();r.push(m)}for(let m of n.reverse()){for(;p.length>=2&&o(p[p.length-2],p[p.length-1],m)<=0;)p.pop();p.push(m)}return r.slice(0,-1).concat(p.slice(0,-1))}function sa(a){let n=[["stand","Standing: not moving"],["waddle","Waddling: walking pace"],["drive","Driving: 15 to 150 km/h"],["fly","Flying: faster than any car"],["carried","Picked up: you're dragging it"],["fainted","Fainted: health hit zero"]];return`
<div class="gt" data-ref="gt">
  <svg class="gt-map" data-ref="svg" role="img" aria-label="Board-game map of Kitchener, Waterloo and Cambridge with a goose">
    <defs>
      <pattern id="gt-hatch" data-ref="hatch" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45)">
        <rect data-ref="hatchBar" width="4" height="10" fill="rgba(255,226,140,.45)"/></pattern>
      <filter id="gt-land-shadow" x="-10%" y="-10%" width="120%" height="130%">
        <feDropShadow data-ref="shadow" dx="0" dy="200" stdDeviation="60" flood-color="#000" flood-opacity=".55"/></filter>
      <mask id="gt-focus" maskUnits="userSpaceOnUse" x="-200000" y="-200000" width="400000" height="400000">
        <rect x="-200000" y="-200000" width="400000" height="400000" fill="#fff"/>
        <path data-ref="maskShape"/></mask>
    </defs>
    <path class="gt-grid" data-ref="grid" vector-effect="non-scaling-stroke"/>
    <g filter="url(#gt-land-shadow)"><path class="gt-region" data-ref="region" vector-effect="non-scaling-stroke"/></g>
    <g filter="url(#gt-land-shadow)" data-ref="terr"></g>
    <g class="gt-streets" data-ref="streets"></g>
    <path class="gt-stops" data-ref="stops"/>
    <g class="gt-ion-layer" data-ref="ion"></g>
    <rect class="gt-dim" x="-200000" y="-200000" width="400000" height="400000" mask="url(#gt-focus)"/>
    <path class="gt-zone-fill" data-ref="zoneFill" vector-effect="non-scaling-stroke"/>
    <path class="gt-zone-line" data-ref="zoneLine"/>
    <g data-ref="labels"></g>
    <g data-ref="badges"></g>
    <g class="gt-goose" data-ref="goose">
      <circle r="36" fill="transparent"/>
      <ellipse class="gt-goose-shadow" cx="0" cy="28" rx="16" ry="4"/>
      <g data-ref="gooseArt"></g>
      <g class="gt-bubble" data-ref="bubble" transform="translate(0 -52)" style="opacity:0;pointer-events:none">
        <rect x="-30" y="-14" width="60" height="28" rx="12"/><path d="M-6 13 L0 22 L6 13" fill="#fff" stroke="#1d1a17" stroke-width="2"/>
        <rect x="-8" y="10" width="16" height="5" fill="#fff"/><text>HONK!</text></g>
    </g>
  </svg>

  <div class="gt-tl">
    <button class="gt-iconbtn" data-act="zone" aria-label="Choose home zone" title="Choose home zone">${_.zone}</button>
    <button class="gt-iconbtn" data-act="help" aria-label="How it works" title="How it works">${_.help}</button>
    <button class="gt-iconbtn" data-act="layers" aria-label="Map layers" title="Map layers">${_.layers}</button>
    <button class="gt-panel gt-zonechip" data-act="zone"><span class="gt-swatch" data-ref="zoneSwatch"></span>
      <span><b data-ref="zoneName"></b><small data-ref="zoneKind"></small></span></button>
  </div>
  <div class="gt-panel gt-layers" data-ref="layers">
    <label><input type="checkbox" checked data-layer="streets"> Bus routes (streets)</label>
    <label><input type="checkbox" checked data-layer="ion"> ION light rail</label>
    <label><input type="checkbox" checked data-layer="stops"> Bus stops (zoom in)</label>
  </div>

  <section class="gt-panel gt-stats" aria-label="Goose GPS">
    <div class="gt-speed"><b data-ref="speed">0</b><span>km/h</span></div>
    <div class="gt-motion" data-ref="motion">Standing</div>
    <dl class="gt-kv">
      <dt>Where</dt><dd data-ref="terrName">-</dd>
      <dt>GPS</dt><dd data-ref="latlon">-</dd>
      <dt class="gt-kv-extra">On screen</dt><dd class="gt-kv-extra" data-ref="screen">-</dd>
      <dt class="gt-kv-extra">Time</dt><dd class="gt-kv-extra" data-ref="clock">08:00</dd>
      
      <dt class="gt-kv-extra">Engine</dt><dd class="gt-kv-extra" data-ref="server">in this browser</dd>
    </dl>
  </section>
  <div class="gt-cities" data-ref="cities"></div>

  <section class="gt-panel gt-bl" aria-label="Nearby and events">
    <div class="gt-tabs" role="tablist">
      <button class="gt-tab" role="tab" aria-selected="true" data-act="tab" data-tab="nearby">Nearby</button>
      <button class="gt-tab" role="tab" aria-selected="false" data-act="tab" data-tab="events">Events</button>
    </div>
    <ul class="gt-list" data-ref="list"></ul>
  </section>

  <section class="gt-panel gt-hud" aria-label="Goose status">
    <div class="gt-avatar" data-ref="avatar"></div>
    <div>
      <div class="gt-hud-name">Gus the Goose <small data-ref="healthNum" style="font-family:var(--gt-body);font-size:12px;opacity:.8">100 HP</small></div>
      <div class="gt-health" role="progressbar" aria-label="Health"><i data-ref="healthFill"></i></div>
      <span class="gt-banner" data-ref="banner">Standing</span>
    </div>
  </section>

  <div class="gt-br">
    <button class="gt-panel gt-toggle gt-toggle-hero" data-act="smooth" data-ref="smoothBtn" aria-pressed="true"
      title="Median filter + moving average on every GPS fix, and a new pose must hold for 3 fixes. Turn it off to see raw GPS.">
      <span class="gt-switch"></span><span><span class="gt-eyebrow">Under the hood</span><b>GPS smoothing</b>
      <small data-ref="smoothSub"></small>
      <small class="gt-flips"><span data-ref="flips">0</span> pose or border flips per minute</small></span></button>
    <button class="gt-panel gt-toggle" data-act="auto" data-ref="autoBtn" aria-pressed="true">
      <span class="gt-switch"></span><span><b>Autopilot</b><small data-ref="autoSub"></small></span></button>
    <button class="gt-panel gt-toggle" data-act="follow" data-ref="followBtn" aria-pressed="false">
      <span class="gt-switch"></span><span><b>Follow goose</b><small>Camera tracks Gus</small></span></button>
    <div class="gt-zoom">
      <button class="gt-iconbtn" data-act="zout" aria-label="Zoom out">${_.minus}</button>
      <button class="gt-iconbtn" data-act="fit" aria-label="Fit home zone">${_.fit}</button>
      <button class="gt-iconbtn" data-act="zin" aria-label="Zoom in">${_.plus}</button>
    </div>
  </div>
  <div class="gt-warn" data-ref="warn" role="status"></div>

  <section class="gt-panel gt-intro" data-ref="intro" role="region" aria-label="Welcome to Goose Turf">
    <button class="gt-iconbtn gt-close" data-act="introClose" aria-label="Dismiss intro">${_.close}</button>
    <div class="gt-intro-art">${dt("stand")}</div>
    <div>
      <h2>Keep Gus on his turf</h2>
      <p>Gus the goose roams Kitchener, Waterloo and Cambridge, and loses health if he strays outside his home zone for too long.
        Park him in a neighbourhood for ${Et} game minutes to claim it, and try to claim every one.</p>
      <p class="gt-intro-tip">Then switch off <b>GPS smoothing</b> (bottom right) to see the noisy raw GPS it cleans up.</p>
      <div class="gt-intro-actions">
        <button class="gt-primary" data-act="introClose">Let's go</button>
        <small>Drag Gus or use the arrow keys.</small>
      </div>
    </div>
  </section>

  <div class="gt-modal" data-ref="picker" role="dialog" aria-label="Choose home zone">
    <div class="gt-panel gt-card">
      <button class="gt-iconbtn gt-close" data-act="close" aria-label="Close">${_.close}</button>
      <h2>Choose a home zone</h2>
      <p>Gus stays healthy inside it. Leave for more than ${Ft} seconds and health starts draining.</p>
      <div class="gt-tabs" role="tablist" style="padding:0">
        <button class="gt-tab" role="tab" data-act="pickTab" data-tab="city">Cities</button>
        <button class="gt-tab" role="tab" data-act="pickTab" data-tab="street">Streets (harder)</button>
      </div>
      <div class="gt-picks" data-ref="picks"></div>
    </div>
  </div>

  <div class="gt-modal" data-ref="about" role="dialog" aria-label="How it works">
    <div class="gt-panel gt-card">
      <button class="gt-iconbtn gt-close" data-act="close" aria-label="Close">${_.close}</button>
      <h2>Goose Turf</h2>
      <p>A live map of Kitchener, Waterloo and Cambridge, played like a board game. Gus the goose moves around the region, and every neighbourhood is a territory you can claim.</p>
      <h3>How to play</h3>
      <ul>
        <li>Pick a home zone: a whole city, or a single street if you want it harder.</li>
        <li>Gus loses health if he stays outside the zone too long, and faints at zero.</li>
        <li>Enter a neighbourhood to raise its counter. Stay ${Et} minutes of game time to claim it.</li>
        <li>Drag Gus with the mouse, or use the arrow keys. Hold Shift to drive, Space to fly.</li>
      </ul>
      <h3>What Gus is doing</h3>
      <div class="gt-states">${n.map(([o,r])=>`<div>${dt(o)}<span>${r}</span></div>`).join("")}</div>
      <p>His pose comes only from his GPS fixes: how far he moved between readings, and how fast.</p>
      <h3>Under the hood</h3>
      <ul>
        <li>Each neighbourhood is a polygon geofence. Every GPS fix is checked against them, and crossing a border fires an enter or exit event.</li>
        <li>Fake GPS readings arrive every ${jt}s with realistic error and the occasional jump, like a phone downtown.</li>
        <li>GPS smoothing throws out single bad readings and waits for a new speed to hold before changing Gus's pose. Turn it off to see the twitching it prevents, and watch the flip counter.</li>
        <li>Street zones are corridors ${Q} m either side of the route.</li>
        <li>The Nearby list searches ION stations, ${a.places.filter(o=>o.kind==="bus").length} bus stops and landmarks with a spatial grid, so it only checks points close to Gus.</li>
        <li>Game time runs ${zt}\xD7 faster than real time.</li>
      </ul>
      <h3>About the map</h3>
      <p>${R(a.attribution)} Neighbourhood shapes are simplified for the game. Not affiliated with Grand River Transit.</p>
    </div>
  </div>

  <div class="gt-modal" data-ref="faint" role="alertdialog" aria-label="Gus fainted">
    <div class="gt-panel gt-card" style="text-align:center">
      <div style="width:120px;margin:0 auto">${dt("fainted")}</div>
      <h2>Gus fainted</h2>
      <p>He spent too long outside <span data-ref="faintZone"></span>. Your claimed neighbourhoods are safe.</p>
      <button class="gt-primary" data-act="respawn">Respawn Gus</button>
    </div>
  </div>
</div>`}return Ve(la);})();
