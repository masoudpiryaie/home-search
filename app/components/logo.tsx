"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import Image from "next/image";

type LogoProps = {
  homeHref: string;
  isAdminRoute?: boolean;
  siteName: string;
  tagline: string;
};

export default function Logo({
  homeHref,
  isAdminRoute = false,
  siteName,
  tagline,
}: LogoProps) {
  return (
    <Link href={homeHref} className="group flex items-center gap-3">
      <div className="flex  items-center justify-center text-[var(--color-primary)] transition group-hover:scale-105 md:h-22 md:w-22">
        <Image
          width={64}
          height={64}
          src="/logo/andormera_256.png"
          alt="HomeRent Logo"
          loading="eager"
          className=" object-contain "
        />
      </div>

      <div className="leading-tight">
        <p className="text-[18px] font-black tracking-[-0.04em] text-[var(--color-text)] md:text-[22px]">
          {isAdminRoute ? "HomeRent Admin" : siteName}
        </p>

        <p className="hidden text-xs font-semibold text-[var(--color-muted)] sm:block">
          {isAdminRoute ? "Manage listings" : tagline}
        </p>
      </div>
    </Link>
  );
}
