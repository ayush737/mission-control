import type { ReactNode } from "react";
import Link from "next/link";

export default function FocusLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <div className="fixed left-4 top-4 z-30">
        <Link
          href="/"
          className="rounded-full border border-slate-800 bg-slate-950/90 px-4 py-2 text-sm text-slate-300 shadow-glow backdrop-blur hover:border-cyan-400/50 hover:text-white"
        >
          Exit focus
        </Link>
      </div>
      {children}
    </div>
  );
}
