"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
} from "@/components/ui/drawer";

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
  { href: "/lux/seekers-collection", label: "The Seeker's Collection" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const showNav = pathname !== "/";
  const isLuxRoute = pathname.startsWith("/lux");
  const isDarkStyledRoute = isLuxRoute || pathname.startsWith("/prologue");
  const navItems = isLuxRoute ? luxNavItems : defaultNavItems;
  const [hash, setHash] = useState("");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

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
        isDarkStyledRoute ? "border-white/10 bg-[#121315]/88" : "border-border bg-background/95"
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
            isDarkStyledRoute ? "text-zinc-200" : ""
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
          <>
            <nav className="hidden items-center gap-6 md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(event) => onNavClick(event, item.href)}
                  className={`text-lg transition-colors hover:text-foreground ${
                    isDarkStyledRoute
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

            <Drawer open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen} direction="right">
              <button
                type="button"
                aria-label="Open navigation menu"
                onClick={() => setIsMobileNavOpen(true)}
                className={`inline-flex items-center justify-center rounded-sm border p-2 md:hidden ${
                  isDarkStyledRoute
                    ? "border-zinc-700 bg-zinc-900/70 text-zinc-100"
                    : "border-border bg-background text-foreground"
                }`}
              >
                <Menu className="size-5" />
              </button>
              <DrawerContent
                className={`md:hidden ${
                  isDarkStyledRoute ? "border-zinc-700 bg-[#17181b] text-zinc-100" : "border-border bg-background"
                }`}
              >
                <nav className="flex flex-col gap-1 p-4 pt-6">
                  {navItems.map((item) => (
                    <DrawerClose asChild key={`mobile-${item.href}`}>
                      <Link
                        href={item.href}
                        onClick={(event) => onNavClick(event, item.href)}
                        className={`rounded-sm border px-3 py-2 text-base ${
                          isDarkStyledRoute
                            ? isActiveHref(item.href)
                              ? "border-zinc-500 bg-zinc-800 text-zinc-100"
                              : "border-zinc-700 bg-zinc-900 text-zinc-300"
                            : isActiveHref(item.href)
                              ? "border-foreground/30 bg-accent text-foreground"
                              : "border-border bg-background text-muted-foreground"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </DrawerClose>
                  ))}
                </nav>
              </DrawerContent>
            </Drawer>
          </>
        ) : null}
      </div>
    </header>
  );
}
