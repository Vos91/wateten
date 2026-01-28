import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wat Eten We? | AI Recepten Generator",
  description: "Scan je Jumbo producten en krijg instant recepten. Simpel, snel, lekker.",
  keywords: ["recepten", "jumbo", "ai", "koken", "meal planning"],
  authors: [{ name: "J-Vos" }],
  openGraph: {
    title: "Wat Eten We?",
    description: "Van Jumbo producten naar recept in seconden",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FFE100",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
