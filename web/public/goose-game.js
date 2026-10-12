"use strict";var GooseTurf=(()=>{var Ot=Object.defineProperty;var _e=Object.getOwnPropertyDescriptor;var Re=Object.getOwnPropertyNames;var Ze=Object.prototype.hasOwnProperty;var Qe=(a,i)=>{for(var o in i)Ot(a,o,{get:i[o],enumerable:!0})},De=(a,i,o,s)=>{if(i&&typeof i=="object"||typeof i=="function")for(let p of Re(i))!Ze.call(a,p)&&p!==o&&Ot(a,p,{get:()=>i[p],enumerable:!(s=_e(i,p))||s.enumerable});return a};var je=a=>De(Ot({},"__esModule",{value:!0}),a);var oa={};Qe(oa,{mount:()=>$e});var ge=`:root {
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
  }
}
:root[data-theme="dark"] {
  --gt-sea: #0f3a47; --gt-sea-deep: #0a2731; --gt-land: #3c4b49;
  --gt-panel: rgba(16, 33, 38, 0.92); --gt-panel-edge: #2f5560; --gt-text: #f3ead2; --gt-muted: #a9bdb9;
}

.gt { position: relative; width: 100%; height: 100%; overflow: hidden; font-family: var(--gt-body); color: var(--gt-text);
  background: radial-gradient(ellipse at 50% 45%, var(--gt-sea) 0%, var(--gt-sea-deep) 75%); user-select: none; -webkit-user-select: none; }
.gt * { box-sizing: border-box; }
.gt button { font: inherit; color: inherit; cursor: pointer; }
.gt button:focus-visible, .gt [tabindex]:focus-visible { outline: 3px solid var(--gt-gold); outline-offset: 2px; }

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
.gt-motion { font-family: var(--gt-display); font-size: 17px; color: var(--gt-gold); margin: 2px 0 8px; }
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
.gt-tab[aria-selected="true"] { background: rgba(255, 255, 255, 0.08); color: var(--gt-text) !important; }
.gt-list { list-style: none; margin: 0; padding: 6px 10px 10px; overflow: auto; font-size: 13px; }
.gt-list li { display: grid; grid-template-columns: 22px 1fr auto; gap: 8px; align-items: center; padding: 5px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.06); }
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
.gt-switch { width: 38px; height: 22px; border-radius: 11px; background: rgba(0, 0, 0, 0.45); position: relative; flex: none; border: 2px solid var(--gt-ink); }
.gt-switch::after { content: ""; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; border-radius: 50%; background: var(--gt-muted); transition: transform 0.15s, background 0.15s; }
[aria-pressed="true"] .gt-switch::after { transform: translateX(16px); background: var(--gt-good); }
.gt-zoom { display: flex; gap: 8px; }

.gt-warn { position: absolute; top: 72px; left: 50%; transform: translateX(-50%); padding: 8px 16px; background: var(--gt-bad); color: #fff;
  border: 2px solid var(--gt-ink); border-radius: 12px; font-weight: 800; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.35); display: none; white-space: nowrap; }
.gt-warn.show { display: block; }

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
  background: rgba(255, 255, 255, 0.05); border: 2px solid transparent; border-radius: 12px; }
.gt-pick .gt-swatch { grid-row: span 2; width: 30px; height: 30px; }
.gt-pick b { font-size: 16px; }
.gt-pick small { color: var(--gt-muted); }
.gt-pick[aria-current="true"] { border-color: var(--gt-gold); }
.gt-primary { margin-top: 14px; padding: 12px 20px; border-radius: 12px; border: 2px solid var(--gt-ink); background: var(--gt-gold); color: var(--gt-ink) !important;
  font-family: var(--gt-display) !important; font-size: 18px; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.35); }
.gt-states { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; margin: 10px 0; }
.gt-states div { display: flex; gap: 8px; align-items: center; font-size: 14px; }
.gt-states svg { width: 44px; height: 44px; flex: none; }
.gt-layers { top: 66px; left: 12px; padding: 10px 14px; display: none; z-index: 4; }
.gt-layers.show { display: block; }
.gt-layers label { display: flex; gap: 8px; align-items: center; padding: 4px 0; font-weight: 700; cursor: pointer; }
.gt-attrib { position: absolute; left: 50%; bottom: 0; transform: translateX(-50%); font-size: 10px; color: var(--gt-muted); opacity: 0.8; white-space: nowrap; pointer-events: none; display: none; }

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
}
@media (prefers-reduced-motion: reduce) {
  .gt-goose * , .gt-zone-fill { animation: none !important; }
}
`;var $="#1d1a17",yt="#8a6c4c",wt="#dccbad",rt="#5f4730",he="#3f2e1f",lt=(a,i,o=!0)=>`
  <ellipse cx="${a}" cy="${i}" rx="6.4" ry="4.5" fill="${$}"/>
  <ellipse cx="${a-1.8}" cy="${i+1.2}" rx="3.2" ry="1.7" fill="#fff" transform="rotate(-12 ${a-1.8} ${i+1.2})"/>
  <path d="M${a+5.5} ${i-1.5} L${a+12} ${i+.5} L${a+5.5} ${i+2.2}Z" fill="${$}"/>
  ${o?`<circle cx="${a+2}" cy="${i-1.3}" r=".9" fill="#fff"/>`:`<path d="M${a+.8} ${i-2.5} l2.4 2.4 m0 -2.4 l-2.4 2.4" stroke="#fff" stroke-width="1"/>`}`,pe=(a=!0)=>`
  <path d="M-17 1 L-27 -3 L-25 3 L-17 8Z" fill="${$}"/>
  <path d="M-4 13 L-1 17" stroke="${$}" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M1 12 V26 M-3 26.5 H7" stroke="${$}" stroke-width="2.6" stroke-linecap="round" fill="none"/>
  <ellipse cx="-3" cy="4" rx="16" ry="10.5" fill="${yt}"/>
  <ellipse cx="1" cy="9" rx="10" ry="4.5" fill="${wt}"/>
  <path d="M-15 -1 Q-1 -7 9 2 Q-1 11 -15 7Z" fill="${rt}"/>
  <path d="M-12 1 Q-4 -1 3 3 M-12 4 Q-5 3 1 5" stroke="${he}" stroke-width="1" fill="none"/>
  <path d="M7 -1 Q10 -14 13.5 -22 L18.5 -21 Q15 -12 14 3Z" fill="${$}"/>
  ${lt(17,-24,a)}`,Nt={stand:pe(),waddle:`<g class="gw-body">
    <path d="M-17 1 L-27 -3 L-25 3 L-17 8Z" fill="${$}"/>
    <path class="gw-leg-a" d="M-4 12 V26 M-8 26.5 H1" stroke="${$}" stroke-width="2.6" stroke-linecap="round" fill="none"/>
    <path class="gw-leg-b" d="M4 12 V26 M0 26.5 H9" stroke="${$}" stroke-width="2.6" stroke-linecap="round" fill="none"/>
    <ellipse cx="-3" cy="4" rx="16" ry="10.5" fill="${yt}"/>
    <ellipse cx="1" cy="9" rx="10" ry="4.5" fill="${wt}"/>
    <path d="M-15 -1 Q-1 -7 9 2 Q-1 11 -15 7Z" fill="${rt}"/>
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
    <ellipse cx="-3" cy="0" rx="16" ry="6.5" fill="${yt}"/>
    <ellipse cx="-1" cy="3" rx="10" ry="3" fill="${wt}"/>
    <path d="M8 -3 Q15 -5 19 -5 L20 0 Q14 0 8 3Z" fill="${$}"/>
    ${lt(22,-3)}
    <path class="gf-wing" d="M-8 -3 Q-6 -22 6 -30 Q8 -16 8 -3Z" fill="${rt}"/>
    <path class="gf-wing" d="M-4 -6 Q-1 -16 4 -22" stroke="${he}" stroke-width="1" fill="none"/>`,carried:`<g class="gc-all">
    <path d="M-4 17 L-5 27 M4 17 L5 27 M-8 27.5 H-2 M2 27.5 H8" stroke="${$}" stroke-width="2.4" stroke-linecap="round"/>
    <path class="gc-wl" d="M-5 -2 Q-22 -6 -30 -24 Q-18 -20 -8 -12 Q-20 -12 -26 -4 Q-14 -2 -6 6Z" fill="${rt}"/>
    <path class="gc-wr" d="M5 -2 Q22 -6 30 -24 Q18 -20 8 -12 Q20 -12 26 -4 Q14 -2 6 6Z" fill="${rt}"/>
    <ellipse cx="0" cy="6" rx="10" ry="13" fill="${yt}"/>
    <ellipse cx="1" cy="10" rx="6" ry="7" fill="${wt}"/>
    <path d="M-2 -5 Q-2 -15 1 -21 L6 -20 Q3 -13 3 -4Z" fill="${$}"/>
    ${lt(4,-23)}</g>`,fainted:`<ellipse cx="0" cy="-26" rx="10" ry="3" fill="none" stroke="#ffd34d" stroke-width="2"/>
    <g transform="translate(0 2) rotate(160)" opacity=".8">${pe(!1)}</g>`},kt=(a,i="")=>`<svg class="${i}" viewBox="-34 -34 68 68" overflow="visible" aria-hidden="true">${Nt[a]}</svg>`;var fe=111320*Math.cos(43.43*Math.PI/180),Q=([a,i])=>({x:(a- -80.45)*fe,y:(43.43-i)*110574}),_t=({x:a,y:i})=>[a/fe+-80.45,43.43-i/110574],X=(a,i)=>Math.hypot(a.x-i.x,a.y-i.y);function dt(a){let i={minX:1/0,minY:1/0,maxX:-1/0,maxY:-1/0};for(let o of a)o.x<i.minX&&(i.minX=o.x),o.y<i.minY&&(i.minY=o.y),o.x>i.maxX&&(i.maxX=o.x),o.y>i.maxY&&(i.maxY=o.y);return i}var $t=(a,i,o=0)=>a.x>=i.minX-o&&a.x<=i.maxX+o&&a.y>=i.minY-o&&a.y<=i.maxY+o;function Rt(a,i){let o=!1;for(let s=0,p=i.length-1;s<i.length;p=s++){let f=i[s],g=i[p];f.y>a.y!=g.y>a.y&&a.x<(g.x-f.x)*(a.y-f.y)/(g.y-f.y)+f.x&&(o=!o)}return o}function Mt(a,i){let o={d:1/0,at:i[0],seg:0};for(let s=0;s<i.length-1;s++){let p=i[s],f=i[s+1],g=f.x-p.x,l=f.y-p.y,m=g*g+l*l||1,k=Math.max(0,Math.min(1,((a.x-p.x)*g+(a.y-p.y)*l)/m)),y={x:p.x+k*g,y:p.y+k*l},L=X(a,y);L<o.d&&(o={d:L,at:y,seg:s})}return o}function Lt(a){let i=0,o=0,s=0;for(let p=0,f=a.length-1;p<a.length;f=p++){let g=a[f].x*a[p].y-a[p].x*a[f].y;i+=g,o+=(a[f].x+a[p].x)*g,s+=(a[f].y+a[p].y)*g}return i?{x:o/(3*i),y:s/(3*i)}:a[0]}var vt=class{constructor(i,o=500){this.size=o;this.cells=new Map;this.key=(i,o)=>`${i},${o}`;for(let s of i){let p=this.key(Math.floor(s.p.x/o),Math.floor(s.p.y/o));(this.cells.get(p)??this.cells.set(p,[]).get(p)).push(s)}}near(i,o){let s=[],p=Math.ceil(o/this.size),f=Math.floor(i.x/this.size),g=Math.floor(i.y/this.size);for(let l=f-p;l<=f+p;l++)for(let m=g-p;m<=g+p;m++)for(let k of this.cells.get(this.key(l,m))??[]){let y=X(i,k.p);y<=o&&s.push({item:k,d:y})}return s.sort((l,m)=>l.d-m.d)}},I=(a,i=!1)=>a.map((o,s)=>`${s?"L":"M"}${o.x.toFixed(0)} ${o.y.toFixed(0)}`).join("")+(i?"Z":"");function me(a){let i=g=>g.map(Q),o=a.cities.map(g=>{let l=i(g.ring);return{...g,ring:l,bbox:dt(l)}}),s=a.territories.map(g=>{let l=i(g.ring);return{...g,ring:l,bbox:dt(l),center:Lt(l)}}),p=a.streets.map(g=>{let l=i(g.line);return{...g,line:l,bbox:dt(l)}}),f=[...a.landmarks.map(g=>({name:g.name,kind:g.kind,p:Q(g.at)})),...a.ion.stations.map(g=>({name:g.name.endsWith("Station")?g.name:`${g.name} Station`,kind:"ion",p:Q(g.at)})),...a.busStops.map(g=>({name:g.name,kind:"bus",p:Q(g.at)}))];return{cities:o,territories:s,streets:p,ionLine:i(a.ion.line),places:f,bbox:dt(o.flatMap(g=>g.ring)),attribution:a.meta.attribution}}var D=250;function Zt(a,i){let o=a.cities.find(f=>f.id===i),s=a.territories.filter(f=>f.city===i),p=s.reduce((f,g)=>X(g.center,Lt(o.ring))<X(f,Lt(o.ring))?g.center:f,s[0].center);return{kind:"city",id:i,name:o.name,bbox:o.bbox,spawn:p,contains:f=>$t(f,o.bbox)&&Rt(f,o.ring)}}function xe(a,i){let o=a.streets.find(s=>s.id===i);return{kind:"street",id:i,name:o.name,bbox:o.bbox,spawn:o.line[Math.floor(o.line.length/2)],contains:s=>$t(s,o.bbox,D)&&Mt(s,o.line).d<=D}}function be(a,i){for(let o of a.territories)if($t(i,o.bbox)&&Rt(i,o.ring))return o;return null}var ue=a=>a<3?"stand":a<15?"waddle":a<150?"drive":"fly",St=class a{constructor(i=!0){this.smoothing=i;this.raw=[];this.smoothed=[];this.motion="stand";this.pending={m:"stand",n:0}}snapshot(){return{smoothing:this.smoothing,raw:this.raw,smoothed:this.smoothed,motion:this.motion,pending:this.pending}}static restore(i){let o=new a(i.smoothing);return Object.assign(o,{raw:i.raw,smoothed:i.smoothed,motion:i.motion,pending:i.pending}),o}reset(i,o){this.raw=[{p:i,t:o}],this.smoothed=[{p:i,t:o}],this.motion="stand",this.pending={m:"stand",n:0}}push(i){if(this.raw.push(i),this.raw.length>6&&this.raw.shift(),!this.smoothing){let k=this.raw[this.raw.length-2]??i,y=X(k.p,i.p)/Math.max(1e-6,i.t-k.t)*3.6;return this.motion=ue(y),this.smoothed=[i],{p:i.p,kmh:y,motion:this.motion}}let o=this.raw.slice(-3),s=k=>o.map(y=>y.p[k]).sort((y,L)=>y-L)[Math.floor(o.length/2)],p=this.smoothed[this.smoothed.length-1]??i,f={x:p.p.x+.55*(s("x")-p.p.x),y:p.p.y+.55*(s("y")-p.p.y)};this.smoothed.push({p:f,t:i.t}),this.smoothed.length>5&&this.smoothed.shift();let g=this.smoothed[0],l=X(g.p,f)/Math.max(1e-6,i.t-g.t)*3.6,m=ue(l);return m===this.motion?this.pending={m,n:0}:m===this.pending.m&&++this.pending.n>=3?(this.motion=m,this.pending={m,n:0}):m!==this.pending.m&&(this.pending={m,n:1}),{p:f,kmh:l,motion:this.motion}}};var zt=60,Dt=.2,ye=8,Ve=.07,jt=4,We=5,qe=10,Ft=3,we=600,Qt={walk:5,drive:60,fly:260},ke={stand:"Standing",waddle:"Waddling",drive:"Driving",fly:"Flying",carried:"Picked up",fainted:"Fainted"},Ke={ion:["#006bb7","I"],bus:["#3b8f6a","B"],campus:["#7b5cc4","U"],park:["#4c9a3f","P"],shop:["#c27a2c","S"],civic:["#5f6f8a","C"],plaza:["#b8485a","\u2605"],transit:["#006bb7","T"],airport:["#3f6fb8","\u2708"]},_={zone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/></svg>',help:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="9.5"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01"/></svg>',layers:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/></svg>',plus:'<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',minus:'<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 12h14"/></svg>',fit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',close:'<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'};var ve="goose-turf:v1";function $e(a,i,o={}){aa();let s=me(i),p=ea(),f=p?.visits??{},g=new Set(p?.claimed??[]),l=Jt(p?.zone??{kind:"city",id:"waterloo"}),m={...l.spawn},k={...m},y={...m},L=new St(!0),O=8*3600;L.reset(m,O);let Vt=0,Et="stand",A="stand",U=1,G=100,J=0,tt=!0,j=!1,T=null,et=null,at=0,ct=0,Yt=0,Wt=0,Y=!1,F=!1,B=!0,C=[],Z=0,z=new Set,V=[],it=[],Me=new vt(s.places,500),At=[],gt=[],pt=o.apiBase?"connecting":"";a.innerHTML=na(s);let u=t=>a.querySelector(`[data-ref="${t}"]`),ht=u("gt"),v=u("svg");ze();let Tt=u("goose"),W=u("gooseArt"),ft=u("bubble"),qt=new Map;a.querySelectorAll("[data-badge]").forEach(t=>qt.set(t.dataset.badge,t));let nt=new Map;a.querySelectorAll("[data-terr]").forEach(t=>nt.set(t.dataset.terr,t));let Le=Array.from(a.querySelectorAll("[data-at]")),w={x:0,y:0,w:1,h:1},Xt=()=>Math.min(v.clientWidth/w.w,v.clientHeight/w.h)||.03;function ot(t){w=t,v.setAttribute("viewBox",`${t.x} ${t.y} ${t.w} ${t.h}`);let e=1/Xt();for(let c of Le)c.setAttribute("transform",`translate(${c.dataset.at}) scale(${e})`);let n=u("hatch");n.setAttribute("width",String(10*e)),n.setAttribute("height",String(10*e)),u("hatchBar").setAttribute("width",String(4*e)),u("hatchBar").setAttribute("height",String(10*e));let r=u("shadow");r.setAttribute("dy",String(6*e)),r.setAttribute("stdDeviation",String(2*e));let d=e;ht.classList.toggle("z-far",d<55),ht.classList.toggle("z-mid",d<14),ht.classList.toggle("z-near",d<6)}function Gt(t){let e=v.clientWidth||1200,n=v.clientHeight||800,d=e>860?{l:60,r:280,t:80,b:120}:{l:20,r:20,t:150,b:260},c=Math.max(100,e-d.l-d.r),x=Math.max(100,n-d.t-d.b),b=Math.max((t.maxX-t.minX)/c,(t.maxY-t.minY)/x),S=(t.minX+t.maxX)/2,h=(t.minY+t.maxY)/2,M=S-(d.l+c/2)*b,P=h-(d.t+x/2)*b;ot({x:M,y:P,w:e*b,h:n*b})}function st(t,e,n){let r=Kt(e,n),d=Math.min(9e4,Math.max(600,w.w*t)),c=w.h*(d/w.w);ot({x:r.x-(r.x-w.x)*(d/w.w),y:r.y-(r.y-w.y)*(c/w.h),w:d,h:c})}function Kt(t,e){let n=v.getScreenCTM();if(!n)return{x:0,y:0};let r=new DOMPoint(t,e).matrixTransform(n.inverse());return{x:r.x,y:r.y}}function Se(t){let e=v.getScreenCTM(),n=a.getBoundingClientRect();if(!e)return{x:0,y:0};let r=new DOMPoint(t.x,t.y).matrixTransform(e);return{x:r.x-n.left,y:r.y-n.top}}function ze(){let t=u("terr"),e=u("badges"),n=u("labels"),r="",d="",c="";for(let h of s.territories){let M=s.cities.find(P=>P.id===h.city);r+=`<path class="gt-terr" data-terr="${h.id}" fill="${M.color}" vector-effect="non-scaling-stroke" d="${I(h.ring,!0)}"/>`,r+=`<path class="gt-terr-shine" vector-effect="non-scaling-stroke" d="${I(h.ring,!0)}" transform="translate(0 -40)"/>`,d+=`<g class="gt-badge" data-badge="${h.id}" data-at="${h.center.x} ${h.center.y}"><circle r="13" stroke="${M.color}"/><text>0</text></g>`,c+=`<g data-at="${h.center.x} ${h.center.y}"><text class="gt-label gt-terr-label" y="27" text-anchor="middle">${R(h.name)}</text></g>`}for(let h of s.cities){r+=`<path class="gt-city-edge" vector-effect="non-scaling-stroke" d="${I(h.ring,!0)}"/>`;let M=h.bbox,P=(M.minY+M.maxY)/2,[K,Pe,Ie,Oe,Ne]=h.id==="cambridge"?[M.maxX,P,"start",14,0]:[M.minX,P,"end",-14,0];c+=`<g data-at="${K} ${Pe}"><text class="gt-label gt-city-label" x="${Oe}" y="${Ne}" text-anchor="${Ie}">${R(h.name)}</text></g>`}for(let[h,M,P]of[["Woolwich",43.565,-80.5],["Wilmot",43.37,-80.62],["North Dumfries",43.315,-80.4]]){let K=Q([P,M]);c+=`<g data-at="${K.x} ${K.y}"><text class="gt-label gt-township" text-anchor="middle">${h}</text></g>`}t.innerHTML=r,u("streets").innerHTML=s.streets.map(h=>`<path class="gt-street" data-street="${h.id}" vector-effect="non-scaling-stroke" d="${I(h.line)}"/>`).join(""),u("ion").innerHTML=`<path class="gt-ion-casing" vector-effect="non-scaling-stroke" d="${I(s.ionLine)}"/>
      <path class="gt-ion" vector-effect="non-scaling-stroke" d="${I(s.ionLine)}"/>`+s.places.filter(h=>h.kind==="ion").map(h=>`<g data-at="${h.p.x} ${h.p.y}"><circle class="gt-station" r="5"/><text class="gt-label gt-station-label" x="9" y="4">${R(h.name.replace(" Station",""))}</text></g>`).join(""),u("stops").setAttribute("d",s.places.filter(h=>h.kind==="bus").map(h=>`M${(h.p.x-18).toFixed(0)} ${h.p.y.toFixed(0)}a18 18 0 1 0 36 0a18 18 0 1 0 -36 0`).join("")),u("region").setAttribute("d",Ee()),e.innerHTML=d,n.innerHTML=c;let x=s.bbox,b=5e3,S=[];for(let h=Math.floor((x.minX-4e4)/b)*b;h<x.maxX+4e4;h+=b)S.push(`M${h} ${x.minY-4e4}V${x.maxY+4e4}`);for(let h=Math.floor((x.minY-4e4)/b)*b;h<x.maxY+4e4;h+=b)S.push(`M${x.minX-4e4} ${h}H${x.maxX+4e4}`);u("grid").setAttribute("d",S.join(""))}function Ee(){let t=s.places.filter(r=>r.kind==="bus").map(r=>r.p),e=ia(t),n=e.reduce((r,d)=>({x:r.x+d.x/e.length,y:r.y+d.y/e.length}),{x:0,y:0});return I(e.map(r=>({x:n.x+(r.x-n.x)*1.16,y:n.y+(r.y-n.y)*1.16})),!0)}function Ut(){let t=u("zoneFill"),e=u("zoneLine"),n=u("maskShape");if(a.querySelectorAll(".gt-street.is-zone").forEach(d=>d.classList.remove("is-zone")),l.kind==="city"){let d=s.cities.find(x=>x.id===l.id),c=I(d.ring,!0);t.setAttribute("d",c),e.setAttribute("d",""),n.setAttribute("d",c),n.setAttribute("fill","#000"),n.removeAttribute("stroke")}else{let d=s.streets.find(x=>x.id===l.id),c=I(d.line);t.setAttribute("d",""),e.setAttribute("d",c),e.setAttribute("stroke-width",String(D*2)),n.setAttribute("d",c),n.setAttribute("fill","none"),n.setAttribute("stroke","#000"),n.setAttribute("stroke-width",String(D*2)),n.setAttribute("stroke-linecap","round"),a.querySelector(`[data-street="${d.id}"]`)?.classList.add("is-zone")}let r=u("zoneSwatch");r.style.background=l.kind==="city"?s.cities.find(d=>d.id===l.id).color:"var(--gt-gold)",u("zoneName").textContent=l.name,u("zoneKind").textContent=l.kind==="city"?"Stay inside the city":`Stay within ${D} m of the street`}function Jt(t){try{return t.kind==="city"?Zt(s,t.id):xe(s,t.id)}catch{return Zt(s,"waterloo")}}function Ye(t){l=Jt(t),Ut(),te(!1),Gt(l.bbox),H(`Home zone set to ${l.name}`,"zone"),It()}function te(t=!0){m={...l.spawn},k={...m},y={...m},L.reset(m,O),G=100,J=0,j=!1,T=null,et=null,ct=0,C=[],Z=0,B=!0,u("faint").classList.remove("show"),t&&(H(`Goose respawned in ${l.name}`,"zone"),q("I'm back!")),N()}function Ae(){let t=[],e=r=>{for(let d=0;d<3;d++){let c=Math.random()*Math.PI*2;t.push({to:{x:r.x+Math.cos(c)*140,y:r.y+Math.sin(c)*140},kmh:5})}},n=(r,d)=>{let c=Math.hypot(d.x,d.y)||1,x={x:r.x+d.x/c*3500,y:r.y+d.y/c*3500};t.push({to:x,kmh:260},{wait:5.5},{to:r,kmh:260},{wait:1})};if(l.kind==="city"){let r=s.territories.filter(b=>b.city===l.id),d=[],c=m,x=[...r];for(;x.length;){x.sort((S,h)=>X(c,S.center)-X(c,h.center));let b=x.shift();d.push(b),c=b.center}d.forEach((b,S)=>{if(t.push({to:b.center,kmh:50},{wait:2}),e(b.center),t.push({wait:1.5}),S===Math.floor(d.length/2)){let h=s.cities.find(K=>K.id===l.id),M={x:(h.bbox.minX+h.bbox.maxX)/2,y:(h.bbox.minY+h.bbox.maxY)/2},P={x:b.center.x-M.x,y:b.center.y-M.y};n(b.center,P)}})}else{let r=s.streets.find(S=>S.id===l.id),d=Mt(m,r.line),c=d.seg<r.line.length/2?r.line.slice(d.seg):r.line.slice(0,d.seg+2).reverse();t.push({to:c[0],kmh:40}),c.forEach((S,h)=>{t.push({to:S,kmh:55}),h===Math.floor(c.length/3)&&(t.push({wait:2}),e(S),t.push({to:S,kmh:5},{wait:1}))});let x=c[c.length-1],b=c[c.length-2]??c[0];t.push({wait:2}),n(x,{x:-(x.y-b.y),y:x.x-b.x})}return t}function Te(t){if(Z>0)return Z-=t,null;C.length||(C=Ae());let e=C[0];if("wait"in e)return Z=e.wait,C.shift(),null;let n=e.kmh/3.6*zt*t,r=X(m,e.to);return r<=n?(C.shift(),{...e.to}):{x:m.x+(e.to.x-m.x)/r*n,y:m.y+(e.to.y-m.y)/r*n}}function ee(){return Math.sqrt(-2*Math.log(Math.random()||1e-9))*Math.cos(2*Math.PI*Math.random())}function Xe(){let t=m;if(!Y&&(t={x:t.x+ee()*ye,y:t.y+ee()*ye},Math.random()<Ve)){let x=Math.random()*Math.PI*2,b=40+Math.random()*60;t={x:t.x+Math.cos(x)*b,y:t.y+Math.sin(x)*b}}let e=L.push({p:t,t:O});y=e.p,Vt=e.kmh,e.motion!==Et&&(Et=e.motion,V.push(performance.now()));let[n,r]=_t(t);o.apiBase&&gt.push({lat:r,lon:n,t:Math.round(O)});let d=be(s,y);d?.id!==T?.id?L.smoothing?(d?.id===et?.id?at++:(et=d,at=1),at>=2&&ae(d)):ae(d):(et=null,at=0);let c=l.contains(y);c!==tt&&(tt=c,H(c?`Back inside ${l.name}`:`Left ${l.name}`,c?"zone":"warn"),c||q("Uh oh")),At=Me.near(y,we).slice(0,7)}function ae(t){T&&(H(`Exited ${T.name}`,"exit"),nt.get(T.id)?.classList.remove("is-here")),T=t,ct=0,et=null,at=0,V.push(performance.now()),t&&(f[t.id]=(f[t.id]??0)+1,H(`Entered ${t.name}`,"enter"),nt.get(t.id)?.classList.add("is-here"),Bt(t.id,!0),q("HONK!"),It())}function Ge(t){g.add(t.id),nt.get(t.id)?.classList.add("is-claimed"),Bt(t.id,!0),H(`Claimed ${t.name} (stayed ${Ft} min)`,"claim"),q("Mine!"),ne(),It()}function Bt(t,e=!1){let n=qt.get(t);if(!n)return;n.querySelector("text").textContent=String(f[t]??0),n.classList.toggle("is-claimed",g.has(t));let r=s.cities.find(d=>d.id===s.territories.find(c=>c.id===t).city);n.querySelector("circle").setAttribute("fill",g.has(t)?r.color:""),e&&(n.classList.remove("pop"),n.getBoundingClientRect(),n.classList.add("pop"))}function Be(){j=!0,B=!1,C=[],H("Goose fainted outside the zone","warn"),u("faintZone").textContent=l.name,u("faint").classList.add("show"),N()}async function Ce(){if(!o.apiBase||!gt.length)return;let t=gt.splice(0,gt.length);try{let n=await(await fetch(`${o.apiBase}/v1/track`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({deviceId:o.deviceId??"goose-1",zone:{kind:l.kind,id:l.id},fixes:t})})).json();pt=`server ok, ${n.latencyMs??"?"} ms`;for(let r of n.events??[])H(`${r.type.replace("_"," ")} ${r.territoryName??r.zone??""}`,"server")}catch{pt="server unreachable"}}o.apiBase&&setInterval(Ce,1e3);let ie=t=>{let e=Math.floor(t/60)%1440;return`${String(Math.floor(e/60)).padStart(2,"0")}:${String(e%60).padStart(2,"0")}`};function H(t,e){it.unshift({at:ie(O),text:t,tag:e}),it.length>40&&it.pop(),ut==="events"&&mt()}let Ct=0;function q(t){ft.querySelector("text").textContent=t;let e=Math.max(54,t.length*9+22),n=ft.querySelector("rect");n.setAttribute("x",String(-e/2)),n.setAttribute("width",String(e)),ft.style.opacity="1",Ct=1.3}let ut="nearby";function mt(){let t=u("list");ut==="nearby"?t.innerHTML=At.length?At.map(({item:e,d:n})=>{let[r,d]=Ke[e.kind]??["#666","\u2022"],c=Math.atan2(e.p.y-y.y,e.p.x-y.x)*(180/Math.PI)+90;return`<li><span class="gt-ico" style="background:${r}">${d}</span><span>${R(e.name)}</span>
          <span class="gt-dist"><span class="gt-arrow" style="transform:rotate(${c.toFixed(0)}deg)">\u2191</span>${ta(n)}</span></li>`}).join(""):`<li class="gt-empty">Nothing within ${we} m. Open field, good grazing.</li>`:t.innerHTML=it.length?it.slice(0,18).map(e=>`<li><span class="gt-ico" style="background:${Ue[e.tag]??"#555"}">${Je[e.tag]??"\u2022"}</span><span>${R(e.text)}</span><span class="gt-dist">${e.at}</span></li>`).join(""):'<li class="gt-empty">No events yet. Move the goose across a border.</li>'}function ne(){u("cities").innerHTML=s.cities.map(t=>{let e=s.territories.filter(r=>r.city===t.id),n=e.filter(r=>g.has(r.id)).length;return`<div class="gt-panel gt-city"><span class="gt-swatch" style="background:${t.color}"></span><b>${t.name}</b>
        <span class="gt-count">${n}/${e.length}</span><span class="gt-bar"><i style="width:${n/e.length*100}%"></i></span></div>`}).join("")}let oe=null;function He(){let t=Se(k),[e,n]=_t(y);u("speed").textContent=String(Math.round(Vt)),u("motion").textContent=ke[A],u("latlon").textContent=`${n.toFixed(5)}, ${e.toFixed(5)}`,u("screen").textContent=`${Math.round(t.x)}, ${Math.round(t.y)} px`,u("terrName").textContent=T?T.name:tt?"Between neighbourhoods":"Outside the cities",u("clock").textContent=ie(O),pt&&(u("server").textContent=pt);let r=u("healthFill");r.style.width=`${G}%`,r.style.backgroundColor=G>60?"var(--gt-good)":G>30?"var(--gt-warn)":"var(--gt-bad)",u("healthNum").textContent=`${Math.ceil(G)} HP`,u("banner").textContent=ke[A],oe!==A&&(u("avatar").innerHTML=kt(A),oe=A);let d=performance.now();for(;V.length&&d-V[0]>6e4;)V.shift();u("flips").textContent=`${V.length} icon or border flips in the last minute`;let c=u("warn");if(!tt&&!j){c.classList.add("show");let x=Math.ceil(jt-J);c.textContent=x>0?`Outside ${l.name}! Health drains in ${x}s`:`Goose is weakening. Get back to ${l.name}!`}else c.classList.remove("show");ut==="nearby"&&mt()}function N(){u("autoBtn").setAttribute("aria-pressed",String(B)),u("autoSub").textContent=B?"Goose tours your zone":"Drag the goose or use the arrow keys",u("smoothBtn").setAttribute("aria-pressed",String(L.smoothing)),u("followBtn").setAttribute("aria-pressed",String(F))}let se=performance.now();function re(t){let e=Math.min(.05,(t-se)/1e3);if(se=t,!j){O+=e*zt;let c=null,x=(z.has("ArrowRight")||z.has("d")?1:0)-(z.has("ArrowLeft")||z.has("a")?1:0),b=(z.has("ArrowDown")||z.has("s")?1:0)-(z.has("ArrowUp")||z.has("w")?1:0);if(!Y&&(x||b)){let h=(z.has(" ")?Qt.fly:z.has("Shift")?Qt.drive:Qt.walk)/3.6*zt*e,M=Math.hypot(x,b);c={x:m.x+x/M*h,y:m.y+b/M*h}}else B&&!Y&&(c=Te(e));for(c&&(Math.abs(c.x-m.x)>.01&&(U=c.x<m.x?-1:1),m=c),Yt+=e;Yt>=Dt;)Yt-=Dt,Xe();tt?(J=0,G=Math.min(100,G+qe*e)):(J+=e,J>jt&&(G-=We*e)),G<=0&&(G=0,Be()),T&&(ct+=e,ct>=Ft&&!g.has(T.id)&&Ge(T))}A=j?"fainted":Y?"carried":Et;let n=Y?m:y,r=Y||!L.smoothing?1:1-Math.exp(-e*10);k={x:k.x+(n.x-k.x)*r,y:k.y+(n.y-k.y)*r};let d=1/Xt();if(Tt.setAttribute("transform",`translate(${k.x} ${k.y}) scale(${d*.95})`),(W.dataset.state!==A||W.dataset.facing!==String(U))&&(W.dataset.state=A,W.dataset.facing=String(U),W.innerHTML=Nt[A],W.setAttribute("transform",`scale(${A==="fainted"||A==="carried"?1:U} 1)`)),Tt.classList.toggle("is-carried",Y),Ct>0&&(Ct-=e)<=0&&(ft.style.opacity="0"),F&&!Y){let c=w.x+w.w/2,x=w.y+w.h/2,b=1-Math.exp(-e*3);ot({...w,x:w.x+(k.x-c)*b,y:w.y+(k.y-x)*b})}(Wt+=e)>.1&&(Wt=0,He()),requestAnimationFrame(re)}let E=new Map,xt=null,bt=0;Tt.addEventListener("pointerdown",t=>{j||(t.stopPropagation(),Y=!0,B=!1,C=[],Z=0,v.setPointerCapture(t.pointerId),E.set(t.pointerId,{x:t.clientX,y:t.clientY}),q("Put me down!"),N())}),v.addEventListener("pointerdown",t=>{if(E.set(t.pointerId,{x:t.clientX,y:t.clientY}),v.setPointerCapture(t.pointerId),E.size===1&&(xt={x:t.clientX,y:t.clientY,view:{...w}},v.classList.add("is-panning")),E.size===2){let[e,n]=[...E.values()];bt=Math.hypot(e.x-n.x,e.y-n.y),xt=null}}),v.addEventListener("pointermove",t=>{if(!E.has(t.pointerId))return;let e=E.get(t.pointerId);if(E.set(t.pointerId,{x:t.clientX,y:t.clientY}),Y){let n=Kt(t.clientX,t.clientY);Math.abs(n.x-m.x)>1&&(U=n.x<m.x?-1:1),m=n;return}if(E.size===2){let[n,r]=[...E.values()],d=Math.hypot(n.x-r.x,n.y-r.y);bt&&st(bt/d,(n.x+r.x)/2,(n.y+r.y)/2),bt=d;return}if(xt){let n=1/Xt();ot({...w,x:w.x-(t.clientX-e.x)*n,y:w.y-(t.clientY-e.y)*n})}});let le=t=>{E.delete(t.pointerId),Y&&!E.size&&(Y=!1,L.reset(m,O),y={...m}),E.size||(xt=null,v.classList.remove("is-panning"))};v.addEventListener("pointerup",le),v.addEventListener("pointercancel",le),v.addEventListener("wheel",t=>{t.preventDefault(),st(Math.exp(t.deltaY*.0015),t.clientX,t.clientY)},{passive:!1});let de=t=>e=>{let n=e.key.length===1?e.key.toLowerCase():e.key;["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","w","a","s","d"," ","Shift"].includes(n)&&(e.target?.closest?.("button")&&n===" "||((n.startsWith("Arrow")||n===" ")&&e.preventDefault(),t?z.add(n):z.delete(n),t&&["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","w","a","s","d"].includes(n)&&B&&(B=!1,C=[],Z=0,N())))};window.addEventListener("keydown",de(!0)),window.addEventListener("keyup",de(!1)),window.addEventListener("blur",()=>z.clear()),window.addEventListener("resize",()=>ot(w)),a.addEventListener("click",t=>{let e=t.target.closest("[data-act]");if(!e)return;let n=e.dataset.act;n==="zone"&&(ce(Pt),u("picker").classList.add("show")),n==="help"&&u("about").classList.add("show"),n==="layers"&&u("layers").classList.toggle("show"),n==="close"&&e.closest(".gt-modal")?.classList.remove("show"),n==="pickTab"&&(Pt=e.dataset.tab,ce(Pt)),n==="pick"&&(Ye({kind:e.dataset.kind,id:e.dataset.id}),u("picker").classList.remove("show")),n==="auto"&&(B=!B,C=[],Z=0,N()),n==="smooth"&&(L.smoothing=!L.smoothing,L.reset(y,O),H(`GPS smoothing ${L.smoothing?"on":"off"}`,"zone"),N()),n==="follow"&&(F=!F,F&&w.w>9e3&&st(6e3/w.w,...Ht()),N()),n==="zin"&&st(.7,...Ht()),n==="zout"&&st(1.4,...Ht()),n==="fit"&&(F=!1,Gt(l.bbox),N()),n==="respawn"&&te(),n==="tab"&&(ut=e.dataset.tab,a.querySelectorAll("[data-act=tab]").forEach(r=>r.setAttribute("aria-selected",String(r===e))),mt())}),a.addEventListener("change",t=>{let e=t.target;e.dataset.layer&&ht.classList.toggle(`gt-hide-${e.dataset.layer}`,!e.checked)});let Ht=()=>{let t=v.getBoundingClientRect();return[t.left+t.width/2,t.top+t.height/2]},Pt=l.kind;function ce(t){a.querySelectorAll("[data-act=pickTab]").forEach(e=>e.setAttribute("aria-selected",String(e.dataset.tab===t))),u("picks").innerHTML=t==="city"?s.cities.map(e=>{let n=s.territories.filter(r=>r.city===e.id).length;return`<button class="gt-pick" data-act="pick" data-kind="city" data-id="${e.id}" aria-current="${l.kind==="city"&&l.id===e.id}">
          <span class="gt-swatch" style="background:${e.color}"></span><b>${e.name}</b><small>${n} neighbourhoods to claim</small></button>`}).join(""):s.streets.map(e=>`<button class="gt-pick" data-act="pick" data-kind="street" data-id="${e.id}" aria-current="${l.kind==="street"&&l.id===e.id}">
          <span class="gt-swatch" style="background:var(--gt-gold)"></span><b>${R(e.name)}</b><small>${R(e.desc)}</small></button>`).join("")}function It(){try{localStorage.setItem(ve,JSON.stringify({claimed:[...g],visits:f,zone:{kind:l.kind,id:l.id}}))}catch{}}for(let t of s.territories)Bt(t.id),g.has(t.id)&&nt.get(t.id)?.classList.add("is-claimed");Ut(),ne(),N(),mt(),requestAnimationFrame(()=>{Gt(v.clientWidth>1100?s.bbox:l.bbox),H(`Goose landed in ${l.name}`,"zone"),q("HONK!"),requestAnimationFrame(re)})}var Ue={enter:"#4c9a3f",exit:"#7a6a58",claim:"#c99a1f",warn:"#e5533d",zone:"#006bb7",server:"#7b5cc4"},Je={enter:"\u2192",exit:"\u2190",claim:"\u2605",warn:"!",zone:"\u25CE",server:"S"},R=a=>a.replace(/[&<>"]/g,i=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[i]),ta=a=>a<1e3?`${Math.round(a/10)*10} m`:`${(a/1e3).toFixed(1)} km`;function ea(){try{let a=localStorage.getItem(ve);return a?JSON.parse(a):null}catch{return null}}function aa(){if(!document.getElementById("gt-style")){let a=document.createElement("style");a.id="gt-style",a.textContent=ge,document.head.appendChild(a)}if(!document.getElementById("gt-fonts")){let a=document.createElement("link");a.id="gt-fonts",a.rel="stylesheet",a.href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Nunito:wght@600;700;800;900&display=swap",document.head.appendChild(a)}}function ia(a){let i=[...a].sort((f,g)=>f.x-g.x||f.y-g.y),o=(f,g,l)=>(g.x-f.x)*(l.y-f.y)-(g.y-f.y)*(l.x-f.x),s=[],p=[];for(let f of i){for(;s.length>=2&&o(s[s.length-2],s[s.length-1],f)<=0;)s.pop();s.push(f)}for(let f of i.reverse()){for(;p.length>=2&&o(p[p.length-2],p[p.length-1],f)<=0;)p.pop();p.push(f)}return s.slice(0,-1).concat(p.slice(0,-1))}function na(a){let i=[["stand","Standing: not moving"],["waddle","Waddling: walking pace"],["drive","Driving: 15 to 150 km/h"],["fly","Flying: faster than any car"],["carried","Picked up: you're dragging it"],["fainted","Fainted: health hit zero"]];return`
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
    <button class="gt-panel gt-toggle" data-act="smooth" data-ref="smoothBtn" aria-pressed="true">
      <span class="gt-switch"></span><span><b>GPS smoothing</b><small data-ref="flips"></small></span></button>
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

  <div class="gt-modal" data-ref="picker" role="dialog" aria-label="Choose home zone">
    <div class="gt-panel gt-card">
      <button class="gt-iconbtn gt-close" data-act="close" aria-label="Close">${_.close}</button>
      <h2>Choose a home zone</h2>
      <p>Gus stays healthy inside it. Leave for more than ${jt} seconds and health starts draining.</p>
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
        <li>Enter a neighbourhood to raise its counter. Stay ${Ft} minutes of game time to claim it.</li>
        <li>Drag Gus with the mouse, or use the arrow keys. Hold Shift to drive, Space to fly.</li>
      </ul>
      <h3>What Gus is doing</h3>
      <div class="gt-states">${i.map(([o,s])=>`<div>${kt(o)}<span>${s}</span></div>`).join("")}</div>
      <p>His pose comes only from his GPS fixes: how far he moved between readings, and how fast.</p>
      <h3>Under the hood</h3>
      <ul>
        <li>Each neighbourhood is a polygon geofence. Every GPS fix is checked against them, and crossing a border fires an enter or exit event.</li>
        <li>Fake GPS readings arrive every ${Dt}s with realistic error and the occasional jump, like a phone downtown.</li>
        <li>GPS smoothing throws out single bad readings and waits for a new speed to hold before changing Gus's pose. Turn it off to see the twitching it prevents, and watch the flip counter.</li>
        <li>Street zones are corridors ${D} m either side of the route.</li>
        <li>The Nearby list searches ION stations, ${a.places.filter(o=>o.kind==="bus").length} bus stops and landmarks with a spatial grid, so it only checks points close to Gus.</li>
        <li>Game time runs ${zt}\xD7 faster than real time.</li>
      </ul>
      <h3>About the map</h3>
      <p>${R(a.attribution)} Neighbourhood shapes are simplified for the game. Not affiliated with Grand River Transit.</p>
    </div>
  </div>

  <div class="gt-modal" data-ref="faint" role="alertdialog" aria-label="Gus fainted">
    <div class="gt-panel gt-card" style="text-align:center">
      <div style="width:120px;margin:0 auto">${kt("fainted")}</div>
      <h2>Gus fainted</h2>
      <p>He spent too long outside <span data-ref="faintZone"></span>. Your claimed neighbourhoods are safe.</p>
      <button class="gt-primary" data-act="respawn">Respawn Gus</button>
    </div>
  </div>
</div>`}return je(oa);})();
