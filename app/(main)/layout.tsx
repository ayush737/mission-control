import type { ReactNode } from "react";
import { MainNav } from "@/components/main-nav";

export const dynamic = "force-dynamic";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <MainNav />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
