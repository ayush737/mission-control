import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const task = typeof body.task === "string" ? body.task.trim() : "";
  const minutes = Number(body.minutes) || 25;
  const cycleType = body.cycleType === "break" ? "break" : "work";

  if (!task) {
    return NextResponse.json({ ok: false, error: "Task is required." }, { status: 400 });
  }

  await prisma.focusSession.create({
    data: {
      task,
      minutes,
      cycleType
    }
  });

  return NextResponse.json({ ok: true });
}
