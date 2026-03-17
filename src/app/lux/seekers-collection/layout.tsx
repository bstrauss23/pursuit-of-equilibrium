import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "The Seekers Collection | Pursuit of Equilibrium",
  description:
    "The Seekers Collection: selected works from the Lux chapter, exploring the boundary between precision and emergence.",
  path: "/lux/seekers-collection",
  image: "/Lux-doorway.jpg",
});

export default function SeekersCollectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
