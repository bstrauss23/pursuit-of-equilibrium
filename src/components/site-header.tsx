"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const defaultNavItems = [
  { href: "/lux", label: "Lux" },
  { href: "/pendulums", label: "Pendulums" },
  { href: "/pendulums#algorithm", label: "Algorithm" },
  { href: "/pendulums#about", label: "About" },
  { href: "/pendulums/gallery", label: "The Gallery" },
  { href: "/pendulums/playground", label: "Playground" },
];
const luxNavItems = [
  { href: "/pendulums", label: "Pendulums" },
  { href: "/lux", label: "Lux" },
  { href: "/lux#about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const showNav = pathname !== "/";
  const isLuxRoute = pathname.startsWith("/lux");
  const navItems = isLuxRoute ? luxNavItems : defaultNavItems;
  const [hash, setHash] = useState("");

  useEffect(() => {
    const updateHash = () => setHash(window.location.hash);
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, [pathname]);

  function isActiveHref(href: string) {
    const [hrefPath, hrefHash = ""] = href.split("#");
    if (hrefPath !== pathname) {
      return false;
    }
    if (!hrefHash) {
      return hash.length === 0;
    }
    return hash === `#${hrefHash}`;
  }

  function onNavClick(event: React.MouseEvent<HTMLAnchorElement>, href: string) {
    const [hrefPath, hrefHash = ""] = href.split("#");
    if (!hrefHash) return;
    if (hrefPath !== pathname) return;

    const target = document.getElementById(hrefHash);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.pushState(null, "", `#${hrefHash}`);
    setHash(`#${hrefHash}`);
  }

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 border-b backdrop-blur ${
        isLuxRoute ? "border-white/10 bg-[#121315]/88" : "border-border bg-background/95"
      }`}
    >
      <div
        className={`mx-auto flex h-16 w-full items-center px-4 md:px-6 ${
          showNav ? "justify-between" : "justify-center"
        }`}
      >
        <Link
          href="/"
          className={`flex items-center gap-3 text-lg font-semibold tracking-wide uppercase ${
            isLuxRoute ? "text-zinc-200" : ""
          }`}
        >
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

        {showNav ? (
          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={(event) => onNavClick(event, item.href)}
                className={`text-lg transition-colors hover:text-foreground ${
                  isLuxRoute
                    ? isActiveHref(item.href)
                      ? "text-zinc-100 underline underline-offset-4"
                      : "text-zinc-400 hover:text-zinc-200"
                    : isActiveHref(item.href)
                      ? "text-foreground underline underline-offset-4"
                      : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        ) : null}
      </div>
    </header>
  );
}
