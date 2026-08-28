"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SupplementsSubnav() {
  const pathname = usePathname();
  const catalog = pathname.startsWith("/supplements");

  return (
    <div className="grid grid-cols-2 gap-1 rounded-2xl bg-cream-100 p-1">
      <Link
        href="/stack"
        className={`rounded-xl px-3 py-2 text-center text-sm font-semibold ${
          catalog ? "text-sage-600" : "bg-white text-sage-900 shadow-sm"
        }`}
      >
        Yours
      </Link>
      <Link
        href="/supplements"
        className={`rounded-xl px-3 py-2 text-center text-sm font-semibold ${
          catalog ? "bg-white text-sage-900 shadow-sm" : "text-sage-600"
        }`}
      >
        Catalog
      </Link>
    </div>
  );
}
