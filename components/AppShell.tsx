"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const nav = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/plan", label: "Plan", icon: PlanIcon },
  { href: "/fitness", label: "Workout", icon: MoveIcon },
  { href: "/stack", label: "Supplements", icon: StackIcon },
  { href: "/settings", label: "More", icon: MoreIcon },
];

function navActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/stack") {
    return (
      pathname === "/stack" ||
      pathname.startsWith("/stack/") ||
      pathname === "/supplements" ||
      pathname.startsWith("/supplements/")
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-cream-50 text-sage-900" style={{ backgroundColor: "rgb(var(--cream-50))", color: "rgb(var(--sage-900))" }}>
      <div className="mx-auto flex min-h-dvh max-w-6xl">
        {/* Desktop side nav */}
        <aside className="hidden w-56 shrink-0 border-r border-cream-200 bg-cream-100/60 p-4 md:flex md:flex-col">
          <Link href="/" className="mb-8 px-2">
            <div className="text-xl font-bold tracking-tight text-sage-800">
              Terrain
            </div>
            <div className="text-xs text-sage-600">Functional wellness</div>
          </Link>
          <nav className="flex flex-1 flex-col gap-1">
            {nav.map((item) => {
              const active = navActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-sage-600 text-white shadow-sm"
                      : "text-sage-700 hover:bg-cream-200"
                  }`}
                >
                  <item.icon active={active} />
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/remedies"
              className={`mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                navActive(pathname, "/remedies")
                  ? "bg-sage-600 text-white shadow-sm"
                  : "text-sage-700 hover:bg-cream-200"
              }`}
            >
              <LeafIcon active={navActive(pathname, "/remedies")} />
              Remedies
            </Link>
            <Link
              href="/reminders"
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                navActive(pathname, "/reminders")
                  ? "bg-sage-600 text-white shadow-sm"
                  : "text-sage-700 hover:bg-cream-200"
              }`}
            >
              <BellIcon active={navActive(pathname, "/reminders")} />
              Reminders
            </Link>
            <Link
              href="/foundations"
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                navActive(pathname, "/foundations")
                  ? "bg-sage-600 text-white shadow-sm"
                  : "text-sage-700 hover:bg-cream-200"
              }`}
            >
              Foundations
            </Link>
            <Link
              href="/search"
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                navActive(pathname, "/search")
                  ? "bg-sage-600 text-white shadow-sm"
                  : "text-sage-700 hover:bg-cream-200"
              }`}
            >
              Search
            </Link>
            <Link
              href="/history"
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                navActive(pathname, "/history")
                  ? "bg-sage-600 text-white shadow-sm"
                  : "text-sage-700 hover:bg-cream-200"
              }`}
            >
              History
            </Link>
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-cream-200/80 bg-cream-50/90 px-4 py-3 backdrop-blur md:hidden">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-lg font-bold text-sage-800">
                Terrain
              </Link>
              <div className="flex gap-2">
                <Link
                  href="/search"
                  className="rounded-full bg-cream-100 px-3 py-1 text-xs font-medium text-sage-700"
                >
                  Search
                </Link>
                <Link
                  href="/foundations"
                  className="rounded-full bg-cream-100 px-3 py-1 text-xs font-medium text-sage-700"
                >
                  Foundations
                </Link>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 pt-4 safe-pb md:px-8 md:pb-8 md:pt-6">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-cream-200 bg-cream-50/95 backdrop-blur md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="mx-auto flex max-w-lg items-stretch justify-between px-1 py-1">
          {nav.map((item) => {
            const active = navActive(pathname, item.href);
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-medium ${
                    active ? "text-sage-700" : "text-sage-500"
                  }`}
                >
                  <span
                    className={`rounded-xl p-1.5 ${
                      active ? "bg-sage-100" : ""
                    }`}
                  >
                    <item.icon active={active} />
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

function iconClass(active: boolean) {
  return active ? "text-current" : "text-sage-500";
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={iconClass(active)} aria-hidden>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
function PlanIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={iconClass(active)} aria-hidden>
      <path d="M7 3v3M17 3v3M4.5 8h15M6 5.5h12A1.5 1.5 0 0 1 19.5 7v12A1.5 1.5 0 0 1 18 20.5H6A1.5 1.5 0 0 1 4.5 19V7A1.5 1.5 0 0 1 6 5.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 12h3v3H8z" fill="currentColor" />
    </svg>
  );
}
function MoveIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={iconClass(active)} aria-hidden>
      <path d="M13 5a2 2 0 1 0-0.01 0M7 21l3-8 3 3 2-6 3 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function StackIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={iconClass(active)} aria-hidden>
      <path d="M4 7.5 12 4l8 3.5-8 3.5L4 7.5Zm0 5 8 3.5 8-3.5M4 17.5 12 21l8-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function LeafIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={iconClass(active)} aria-hidden>
      <path d="M5 19c8 0 14-6 14-14-8 0-14 6-14 14Zm0 0c3-3 6-4 9-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function MoreIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={iconClass(active)} aria-hidden>
      <circle cx="6" cy="12" r="1.6" fill="currentColor" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      <circle cx="18" cy="12" r="1.6" fill="currentColor" />
    </svg>
  );
}
function BellIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={iconClass(active)} aria-hidden>
      <path d="M6 9a6 6 0 1 1 12 0c0 7 2 7 2 7H4s2 0 2-7Zm6 11a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
