import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXTAUTH_URL || "https://openslot.matasuniversity.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "OpenSlot — MATAS University",
    template: "%s",
  },
  description: "Зручне бронювання зустрічей MATAS University",
  applicationName: "OpenSlot",
  icons: {
    icon: [{ url: "/matas-mark.svg", type: "image/svg+xml" }],
    shortcut: "/matas-mark.svg",
  },
  openGraph: {
    type: "website",
    locale: "uk_UA",
    siteName: "OpenSlot — MATAS University",
    title: "OpenSlot — MATAS University",
    description: "Оберіть зручний час і забронюйте зустріч",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "OpenSlot — планувальник зустрічей MATAS University",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenSlot — MATAS University",
    description: "Оберіть зручний час і забронюйте зустріч",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  );
}
