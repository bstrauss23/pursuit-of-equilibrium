 "use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  const isLuxRoute = pathname.startsWith("/lux");

  if (pathname === "/") return null;

  return (
    <footer
      className={isLuxRoute ? "border-t border-white/10 !bg-[#141518] text-zinc-200" : "border-t border-border"}
      style={isLuxRoute ? { backgroundColor: "#141518" } : undefined}
    >
      <div className="mx-auto content-width grid gap-8 px-4 py-10 md:grid-cols-2 md:px-6">
        <div className="space-y-3">
          <p className={`text-lg font-semibold uppercase tracking-wide ${isLuxRoute ? "text-zinc-100" : ""}`}>
            Ben Strauss
          </p>
          <div className={`flex items-center gap-4 text-lg ${isLuxRoute ? "text-zinc-400" : "text-muted-foreground"}`}>
            <a href="https://x.com/benstraussphoto" target="_blank" rel="noreferrer">
              <Image
                src="/6837359e43203a02f938207b_twitter.svg"
                alt="X"
                width={18}
                height={18}
                className={`h-[18px] w-[18px] ${isLuxRoute ? "brightness-0 invert opacity-80" : ""}`}
              />
            </a>
            <a href="https://www.instagram.com/benstraussphotography/" target="_blank" rel="noreferrer">
              <Image
                src="/6837359e82c2de3f708f4835_instagram.svg"
                alt="Instagram"
                width={18}
                height={18}
                className={`h-[18px] w-[18px] ${isLuxRoute ? "brightness-0 invert opacity-80" : ""}`}
              />
            </a>
          </div>
        </div>

        <div className="space-y-3">
          <p className={`text-lg font-semibold uppercase tracking-wide ${isLuxRoute ? "text-zinc-100" : ""}`}>
            Transient Labs
          </p>
          <div className={`flex items-center gap-4 text-lg ${isLuxRoute ? "text-zinc-400" : "text-muted-foreground"}`}>
            <a href="https://x.com/TransientLabs" target="_blank" rel="noreferrer">
              <Image
                src="/6837359e43203a02f938207b_twitter.svg"
                alt="X"
                width={18}
                height={18}
                className={`h-[18px] w-[18px] ${isLuxRoute ? "brightness-0 invert opacity-80" : ""}`}
              />
            </a>
            <a href="https://www.instagram.com/transient_labs/" target="_blank" rel="noreferrer">
              <Image
                src="/6837359e82c2de3f708f4835_instagram.svg"
                alt="Instagram"
                width={18}
                height={18}
                className={`h-[18px] w-[18px] ${isLuxRoute ? "brightness-0 invert opacity-80" : ""}`}
              />
            </a>
          </div>
        </div>
      </div>
      <div className={isLuxRoute ? "border-t border-white/10 py-4" : "border-t border-border py-4"}>
        <p className={`mx-auto content-width px-4 text-sm md:px-6 md:text-lg ${isLuxRoute ? "text-zinc-400" : "text-muted-foreground"}`}>
          © 2025 Transient Labs, Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
