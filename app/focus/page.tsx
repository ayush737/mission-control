import { prisma } from "@/lib/prisma";
import { FocusTimer } from "@/components/focus-timer";

export const dynamic = "force-dynamic";

export default async function FocusPage() {
  const config = await prisma.appConfig.findUnique({ where: { id: "singleton" } });

  return <FocusTimer initialTask={config?.currentFocusTask ?? "Choose one task and begin."} />;
}
