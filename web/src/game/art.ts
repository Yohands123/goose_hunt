// Original goose artwork, one pose per state. Drawn in a 64x64 box centred on the body.
export type GooseState = "stand" | "waddle" | "drive" | "fly" | "carried" | "fainted";

const INK = "#1d1a17", BODY = "#8a6c4c", BELLY = "#dccbad", WING = "#5f4730", LINE = "#3f2e1f";

const head = (x: number, y: number, eye = true) => `
  <ellipse cx="${x}" cy="${y}" rx="6.4" ry="4.5" fill="${INK}"/>
  <ellipse cx="${x - 1.8}" cy="${y + 1.2}" rx="3.2" ry="1.7" fill="#fff" transform="rotate(-12 ${x - 1.8} ${y + 1.2})"/>
  <path d="M${x + 5.5} ${y - 1.5} L${x + 12} ${y + 0.5} L${x + 5.5} ${y + 2.2}Z" fill="${INK}"/>
  ${eye ? `<circle cx="${x + 2}" cy="${y - 1.3}" r=".9" fill="#fff"/>` : `<path d="M${x + 0.8} ${y - 2.5} l2.4 2.4 m0 -2.4 l-2.4 2.4" stroke="#fff" stroke-width="1"/>`}`;

const standBody = (eye = true) => `
  <path d="M-17 1 L-27 -3 L-25 3 L-17 8Z" fill="${INK}"/>
  <path d="M-4 13 L-1 17" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M1 12 V26 M-3 26.5 H7" stroke="${INK}" stroke-width="2.6" stroke-linecap="round" fill="none"/>
  <ellipse cx="-3" cy="4" rx="16" ry="10.5" fill="${BODY}"/>
  <ellipse cx="1" cy="9" rx="10" ry="4.5" fill="${BELLY}"/>
  <path d="M-15 -1 Q-1 -7 9 2 Q-1 11 -15 7Z" fill="${WING}"/>
  <path d="M-12 1 Q-4 -1 3 3 M-12 4 Q-5 3 1 5" stroke="${LINE}" stroke-width="1" fill="none"/>
  <path d="M7 -1 Q10 -14 13.5 -22 L18.5 -21 Q15 -12 14 3Z" fill="${INK}"/>
  ${head(17, -24, eye)}`;

export const GOOSE: Record<GooseState, string> = {
  stand: standBody(),

  waddle: `<g class="gw-body">
    <path d="M-17 1 L-27 -3 L-25 3 L-17 8Z" fill="${INK}"/>
    <path class="gw-leg-a" d="M-4 12 V26 M-8 26.5 H1" stroke="${INK}" stroke-width="2.6" stroke-linecap="round" fill="none"/>
    <path class="gw-leg-b" d="M4 12 V26 M0 26.5 H9" stroke="${INK}" stroke-width="2.6" stroke-linecap="round" fill="none"/>
    <ellipse cx="-3" cy="4" rx="16" ry="10.5" fill="${BODY}"/>
    <ellipse cx="1" cy="9" rx="10" ry="4.5" fill="${BELLY}"/>
    <path d="M-15 -1 Q-1 -7 9 2 Q-1 11 -15 7Z" fill="${WING}"/>
    <path d="M7 -1 Q10 -14 13.5 -22 L18.5 -21 Q15 -12 14 3Z" fill="${INK}"/>
    ${head(17, -24)}</g>`,

  drive: `<g class="gd-car">
    <path d="M-31 4 H-25 M-30 9 H-26" stroke="#f3ead2" stroke-width="1.6" stroke-linecap="round" opacity=".75"/>
    <path d="M-2 0 Q-1 -12 1 -18 L6 -17 Q4 -10 4 0Z" fill="${INK}"/>
    ${head(4, -20)}
    <path d="M-23 14 Q-24 4 -16 3 L-10 3 Q-6 -5 4 -5 L10 -5 Q15 -5 18 3 L22 4 Q26 6 25 14Z" fill="#006bb7" stroke="${INK}" stroke-width="1.2"/>
    <path d="M-8 3 Q-5 -2 -3 -2 L-3 3Z M6 -2 L9 -2 Q12 -2 14 3 L6 3Z" fill="#cfe6f5"/>
    <circle cx="24" cy="8" r="1.6" fill="#ffe58a"/>
    <circle cx="-13" cy="15" r="5.5" fill="${INK}"/><circle cx="-13" cy="15" r="2" fill="#c9c2b0"/>
    <circle cx="14" cy="15" r="5.5" fill="${INK}"/><circle cx="14" cy="15" r="2" fill="#c9c2b0"/></g>`,

  fly: `
    <path d="M-18 -1 L-28 -4 L-27 3Z" fill="${INK}"/>
    <path class="gf-far" d="M-6 0 Q-2 14 10 20 Q6 8 6 1Z" fill="#4a3725"/>
    <ellipse cx="-3" cy="0" rx="16" ry="6.5" fill="${BODY}"/>
    <ellipse cx="-1" cy="3" rx="10" ry="3" fill="${BELLY}"/>
    <path d="M8 -3 Q15 -5 19 -5 L20 0 Q14 0 8 3Z" fill="${INK}"/>
    ${head(22, -3)}
    <path class="gf-wing" d="M-8 -3 Q-6 -22 6 -30 Q8 -16 8 -3Z" fill="${WING}"/>
    <path class="gf-wing" d="M-4 -6 Q-1 -16 4 -22" stroke="${LINE}" stroke-width="1" fill="none"/>`,

  carried: `<g class="gc-all">
    <path d="M-4 17 L-5 27 M4 17 L5 27 M-8 27.5 H-2 M2 27.5 H8" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>
    <path class="gc-wl" d="M-5 -2 Q-22 -6 -30 -24 Q-18 -20 -8 -12 Q-20 -12 -26 -4 Q-14 -2 -6 6Z" fill="${WING}"/>
    <path class="gc-wr" d="M5 -2 Q22 -6 30 -24 Q18 -20 8 -12 Q20 -12 26 -4 Q14 -2 6 6Z" fill="${WING}"/>
    <ellipse cx="0" cy="6" rx="10" ry="13" fill="${BODY}"/>
    <ellipse cx="1" cy="10" rx="6" ry="7" fill="${BELLY}"/>
    <path d="M-2 -5 Q-2 -15 1 -21 L6 -20 Q3 -13 3 -4Z" fill="${INK}"/>
    ${head(4, -23)}</g>`,

  fainted: `<ellipse cx="0" cy="-26" rx="10" ry="3" fill="none" stroke="#ffd34d" stroke-width="2"/>
    <g transform="translate(0 2) rotate(160)" opacity=".8">${standBody(false)}</g>`,
};

export const gooseSvg = (s: GooseState, cls = "") =>
  `<svg class="${cls}" viewBox="-34 -34 68 68" overflow="visible" aria-hidden="true">${GOOSE[s]}</svg>`;
