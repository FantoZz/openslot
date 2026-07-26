import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "MATAS University · Планувальник зустрічей", description: "Зручне бронювання зустрічей MATAS University" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="uk"><body>{children}</body></html>;
}
