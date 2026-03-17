import type { Metadata } from "next";
import { LandingDoorways } from "@/components/landing-doorways";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Pursuit of Equilibrium by Ben Strauss",
  description: "Pursuit of Equilibrium explores pendulum systems across photography and generative art, capturing the evolution of motion as it moves toward balance and revealing the patterns hidden within.",
  path: "/",
  image: "/PoE-opengraph.jpg",
});

export default function Home() {
  return <LandingDoorways />;
}
