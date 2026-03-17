import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Chapter 1: Lux by Ben Strauss",
  description:
    "Lux captures the motion of real pendulums in long exposure, turning the laws of physics into visible geometry as systems move toward equilibrium.",
  path: "/lux",
  image: "/Lux-doorway.jpg",
});

export default function LuxLayout({ children }: { children: React.ReactNode }) {
  return children;
}
