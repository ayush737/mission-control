import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/finance", label: "Finance" },
  { href: "/career", label: "Career" },
  { href: "/review", label: "Weekly Review" },
  { href: "/focus", label: "Focus Mode" }
];

export async function MainNav() {
  const config = await prisma.appConfig.findUnique({ where: { id: "singleton" } });

  return (
    <header className="sticky top-0 z-20 border-b border-slate-900/80 bg-slate-950/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Mission Control</p>
            <h1 className="mt-1 text-xl font-semibold text-white">{config?.mission ?? "Mission Control"}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="info">Pi friendly</Badge>
            <Badge tone="success">Dark mode</Badge>
          </div>
        </div>

        <nav className="flex flex-wrap gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400/50 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
