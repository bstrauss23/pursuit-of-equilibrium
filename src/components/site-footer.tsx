 "use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid w-full gap-8 px-4 py-10 md:grid-cols-2 md:px-6">
        <div className="space-y-3">
          <p className="text-lg font-semibold uppercase tracking-wide">Ben Strauss</p>
          <div className="flex items-center gap-4 text-lg text-muted-foreground">
            <a href="https://x.com/benstraussphoto" target="_blank" rel="noreferrer">
              <Image
                src="/6837359e43203a02f938207b_twitter.svg"
                alt="X"
                width={18}
                height={18}
                className="h-[18px] w-[18px]"
              />
            </a>
            <a href="https://www.instagram.com/benstraussphotography/" target="_blank" rel="noreferrer">
              <Image
                src="/6837359e82c2de3f708f4835_instagram.svg"
                alt="Instagram"
                width={18}
                height={18}
                className="h-[18px] w-[18px]"
              />
            </a>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-lg font-semibold uppercase tracking-wide">Transient Labs</p>
          <div className="flex items-center gap-4 text-lg text-muted-foreground">
            <a href="https://x.com/TransientLabs" target="_blank" rel="noreferrer">
              <Image
                src="/6837359e43203a02f938207b_twitter.svg"
                alt="X"
                width={18}
                height={18}
                className="h-[18px] w-[18px]"
              />
            </a>
            <a href="https://www.instagram.com/transient_labs/" target="_blank" rel="noreferrer">
              <Image
                src="/6837359e82c2de3f708f4835_instagram.svg"
                alt="Instagram"
                width={18}
                height={18}
                className="h-[18px] w-[18px]"
              />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-border py-4">
        <p className="mx-auto w-full px-4 text-lg text-muted-foreground md:px-6">
          © 2025 Transient Labs, Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
