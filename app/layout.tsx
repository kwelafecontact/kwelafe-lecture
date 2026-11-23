import type { Metadata, Viewport } from "next";
import "./globals.css";
import EnregistrerSW from "@/components/EnregistrerSW";

export const metadata: Metadata = {
  title: "Kwélafé Lecture",
  description: "La bibliothèque numérique de Kwélafé Production : culture, créole et patrimoine de La Réunion.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Kwélafé", statusBarStyle: "default" },
  icons: { icon: "/icone-192.png", apple: "/icone-180.png" },
};

export const viewport: Viewport = {
  themeColor: "#c8361d",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Nunito:wght@400;600;700;800&display=swap"
        />
      </head>
      <body>
        {children}
        <EnregistrerSW />
      </body>
    </html>
  );
}
