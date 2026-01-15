import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { FooterNew } from "@/components/marketing/footer-new";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KLOZD - Le CRM tout-en-un pour closer plus de deals",
  description:
    "KLOZD est le CRM intelligent qui remplace 6+ outils. Trackez vos leads, closez vos deals et pilotez votre croissance avec une seule plateforme.",
  keywords: ["CRM", "leads", "ventes", "pipeline", "automatisation", "IA", "intelligence artificielle", "prospection"],
  authors: [{ name: "KLOZD" }],
  openGraph: {
    title: "KLOZD - Le CRM tout-en-un",
    description:
      "Un seul outil pour tracker tous tes leads, closer tous tes deals et piloter ta croissance.",
    type: "website",
    locale: "fr_FR",
    siteName: "KLOZD",
    images: [
      {
        url: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/58e650af-b1d4-45f0-87c9-7e263633a2e5/id-preview-fb2777cc--08021a3c-94aa-4bd7-9b5a-bb93f24bce7d.lovable.app-1768395572662.png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@klozd",
    title: "KLOZD - Le CRM tout-en-un",
    description: "Un seul outil pour tracker tous tes leads, closer tous tes deals et piloter ta croissance.",
    images: [
      "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/58e650af-b1d4-45f0-87c9-7e263633a2e5/id-preview-fb2777cc--08021a3c-94aa-4bd7-9b5a-bb93f24bce7d.lovable.app-1768395572662.png",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${inter.variable} font-sans antialiased`}
        style={{ fontFamily: "Inter, system-ui, sans-serif" }}
      >
        {children}
        <FooterNew />
      </body>
    </html>
  );
}
