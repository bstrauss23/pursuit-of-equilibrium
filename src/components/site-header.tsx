"use client";

import Link from "next/link";
import Image from "next/image";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/lux", label: "Lux" },
  { href: "/pendulums", label: "Pendulums" },
];

export function SiteHeader() {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3 text-lg font-semibold tracking-wide uppercase">
          <Image
            src="/poe-logo-500.jpg"
            alt="Pursuit of Equilibrium logo"
            width={34}
            height={34}
            priority
            className="h-[34px] w-[34px] object-cover"
          />
          <span>Pursuit of Equilibrium</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-lg text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
