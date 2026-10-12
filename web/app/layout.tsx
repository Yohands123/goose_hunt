import type { ReactNode } from "react";

export const metadata = {
  title: "Goose Turf: Kitchener-Waterloo-Cambridge",
  description: "A live board-game map of KW and Cambridge. Keep Gus the goose in his zone and claim every neighbourhood.",
};
export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, height: "100dvh", background: "#0a2731" }}>{children}</body>
    </html>
  );
}
