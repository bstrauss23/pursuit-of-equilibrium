import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteUrl } from "@/lib/metadata";

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: "Pursuit of Equilibrium",
  description:
    "Pursuit of Equilibrium by Ben Strauss. Physics-based artworks exploring motion, structure, and emergence across chapters.",
  openGraph: {
    type: "website",
    siteName: "Pursuit of Equilibrium",
    title: "Pursuit of Equilibrium",
    description:
      "Pursuit of Equilibrium by Ben Strauss. Physics-based artworks exploring motion, structure, and emergence across chapters.",
    url: "/",
    images: [{ url: "/poe-logo-1024.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pursuit of Equilibrium",
    description:
      "Pursuit of Equilibrium by Ben Strauss. Physics-based artworks exploring motion, structure, and emergence across chapters.",
    images: ["/poe-logo-1024.jpg"],
  },
  icons: {
    icon: "/favicon.jpg",
    shortcut: "/favicon.jpg",
    apple: "/favicon.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} min-h-screen antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="mx-auto w-full flex-1 px-4 pt-24 pb-8 md:px-6">
            {children}
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
