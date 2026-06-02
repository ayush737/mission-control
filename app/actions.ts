"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { todayKey, weekKey } from "@/lib/dates";

function toNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return 0;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toInt(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return 0;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function updateAppConfig(formData: FormData) {
  await prisma.appConfig.upsert({
    where: { id: "singleton" },
    update: {
      mission: toText(formData.get("mission")) || "Become Debt Free",
      missionProgress: Math.max(0, Math.min(100, toInt(formData.get("missionProgress")))),
      monthlyIncome: toNumber(formData.get("monthlyIncome")),
      extraDebtPayment: toNumber(formData.get("extraDebtPayment")),
      currentFocusTask: toText(formData.get("currentFocusTask")) || "Choose the next meaningful task.",
      weeklyWinGoal: toText(formData.get("weeklyWinGoal")) || "Keep the streak alive."
    },
    create: {
      id: "singleton",
      mission: toText(formData.get("mission")) || "Become Debt Free",
      missionProgress: Math.max(0, Math.min(100, toInt(formData.get("missionProgress")))),
      monthlyIncome: toNumber(formData.get("monthlyIncome")),
      extraDebtPayment: toNumber(formData.get("extraDebtPayment")),
      currentFocusTask: toText(formData.get("currentFocusTask")) || "Choose the next meaningful task.",
      weeklyWinGoal: toText(formData.get("weeklyWinGoal")) || "Keep the streak alive."
    }
  });

  revalidatePath("/");
  revalidatePath("/finance");
  revalidatePath("/career");
  revalidatePath("/focus");
}

export async function updateMoneySnapshot(formData: FormData) {
  await prisma.moneySnapshot.upsert({
    where: { id: "singleton" },
    update: {
      savings: toNumber(formData.get("savings")),
      debt: toNumber(formData.get("debt")),
      emis: toNumber(formData.get("emis")),
      monthlyBills: toNumber(formData.get("monthlyBills")),
      netWorth: toNumber(formData.get("netWorth"))
    },
    create: {
      id: "singleton",
      savings: toNumber(formData.get("savings")),
      debt: toNumber(formData.get("debt")),
      emis: toNumber(formData.get("emis")),
      monthlyBills: toNumber(formData.get("monthlyBills")),
      netWorth: toNumber(formData.get("netWorth"))
    }
  });

  revalidatePath("/");
  revalidatePath("/finance");
}

export async function addBigThreeTask(formData: FormData) {
  const title = toText(formData.get("title"));
  if (!title) return;

  const dayKey = todayKey();
  const count = await prisma.bigThreeTask.count({ where: { dayKey } });
  if (count >= 3) return;

  await prisma.bigThreeTask.create({
    data: {
      dayKey,
      title,
      position: count
    }
  });

  revalidatePath("/");
}

export async function toggleBigThreeTask(formData: FormData) {
  const id = toInt(formData.get("id"));
  const completed = formData.get("completed") === "true";

  await prisma.bigThreeTask.update({
    where: { id },
    data: { completed }
  });

  revalidatePath("/");
}

export async function deleteBigThreeTask(formData: FormData) {
  const id = toInt(formData.get("id"));
  await prisma.bigThreeTask.delete({ where: { id } });
  revalidatePath("/");
}

export async function toggleHabit(formData: FormData) {
  const habitId = toInt(formData.get("habitId"));
  const dayKey = toText(formData.get("dayKey")) || todayKey();
  const completed = formData.get("completed") === "true";

  await prisma.habitLog.upsert({
    where: {
      habitId_dayKey: {
        habitId,
        dayKey
      }
    },
    update: { completed },
    create: { habitId, dayKey, completed }
  });

  revalidatePath("/");
  revalidatePath("/review");
}

export async function updateSkill(formData: FormData) {
  const id = toInt(formData.get("id"));
  const progress = Math.max(0, Math.min(100, toInt(formData.get("progress"))));
  const notes = toText(formData.get("notes"));
  const hoursIncrement = Math.max(0, toNumber(formData.get("hoursIncrement")));
  const dayKey = todayKey();

  const skill = await prisma.skill.update({
    where: { id },
    data: {
      progress,
      notes
    }
  });

  if (hoursIncrement > 0) {
    await prisma.skill.update({
      where: { id },
      data: {
        studyHours: {
          increment: hoursIncrement
        }
      }
    });

    await prisma.studyLog.create({
      data: {
        skillId: skill.id,
        dayKey,
        hours: hoursIncrement
      }
    });
  }

  revalidatePath("/");
  revalidatePath("/career");
  revalidatePath("/review");
}

export async function addEmi(formData: FormData) {
  const name = toText(formData.get("name"));
  if (!name) return;

  await prisma.emi.create({
    data: {
      name,
      amount: toNumber(formData.get("amount")),
      interest: toNumber(formData.get("interest")),
      remainingMonths: Math.max(1, toInt(formData.get("remainingMonths")))
    }
  });

  revalidatePath("/finance");
}

export async function deleteEmi(formData: FormData) {
  const id = toInt(formData.get("id"));
  await prisma.emi.delete({ where: { id } });
  revalidatePath("/finance");
}

export async function addCreditCard(formData: FormData) {
  const name = toText(formData.get("name"));
  if (!name) return;

  await prisma.creditCard.create({
    data: {
      name,
      balance: toNumber(formData.get("balance")),
      apr: toNumber(formData.get("apr")),
      minimumPayment: toNumber(formData.get("minimumPayment"))
    }
  });

  revalidatePath("/finance");
}

export async function deleteCreditCard(formData: FormData) {
  const id = toInt(formData.get("id"));
  await prisma.creditCard.delete({ where: { id } });
  revalidatePath("/finance");
}

export async function addBill(formData: FormData) {
  const name = toText(formData.get("name"));
  if (!name) return;

  await prisma.bill.create({
    data: {
      name,
      amount: toNumber(formData.get("amount")),
      dueDay: toInt(formData.get("dueDay")) || null,
      active: true
    }
  });

  revalidatePath("/finance");
}

export async function toggleBill(formData: FormData) {
  const id = toInt(formData.get("id"));
  const active = formData.get("active") === "true";
  await prisma.bill.update({ where: { id }, data: { active } });
  revalidatePath("/finance");
}

export async function deleteBill(formData: FormData) {
  const id = toInt(formData.get("id"));
  await prisma.bill.delete({ where: { id } });
  revalidatePath("/finance");
}

export async function saveReviewNote(formData: FormData) {
  const currentWeekKey = weekKey();
  const wins = toText(formData.get("wins"));
  const losses = toText(formData.get("losses"));

  await prisma.reviewNote.upsert({
    where: { weekKey: currentWeekKey },
    update: { wins, losses },
    create: { weekKey: currentWeekKey, wins, losses }
  });

  revalidatePath("/review");
  revalidatePath("/career");
}

export async function toggleDailyMissionCompletion(formData: FormData) {
  const date = toText(formData.get("date")) || todayKey();
  const completed = formData.get("completed") === "true";

  await prisma.dailyMission.update({
    where: { date },
    data: { completed }
  });

  revalidatePath("/");
}
