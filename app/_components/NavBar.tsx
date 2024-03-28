"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavBar() {
  const pathname = usePathname();
  return (
    <nav className="flex h-16 gap-8 pr-8 justify-end items-center">
      {pathname !== "/" && (
        <Link className="text-white hover:underline hover:text-gray-200" href="/">
          Create
        </Link>
      )}
      {pathname !== "/countdowns" && (
        <Link className="text-white hover:underline hover:text-gray-200" href="/countdowns">
          Show all
        </Link>
      )}
    </nav>
  );
}
