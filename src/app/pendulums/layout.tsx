import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Pendulums by Ben Strauss",
  description:
    "Chapter II of Ben's Pursuit of Equilibrium series, this generative art collection is modeled after real-world Blackburn pendulum physics. Each piece is a live art performance, drawing itself stroke by stroke, shaped by imperfection, entropy, and time.",
  path: "/pendulums",
  image: "/hero-image-new.jpg",
});

export default function PendulumsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
