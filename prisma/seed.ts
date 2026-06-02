import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.appConfig.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      mission: "Become Debt Free",
      missionProgress: 18,
      monthlyIncome: 5000,
      extraDebtPayment: 500,
      currentFocusTask: "Audit the next money leak and remove it."
    }
  });

  await prisma.moneySnapshot.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      savings: 2500,
      debt: 18000,
      emis: 1200,
      monthlyBills: 900,
      netWorth: -15500
    }
  });

  const habits = ["Gym", "Study", "Sleep", "No Spend Day"];
  for (let i = 0; i < habits.length; i += 1) {
    await prisma.habit.upsert({
      where: { name: habits[i] },
      update: { sortOrder: i },
      create: { name: habits[i], sortOrder: i }
    });
  }

  const skills = ["Playwright", "Docker", "AWS", "System Design"];
  for (let i = 0; i < skills.length; i += 1) {
    await prisma.skill.upsert({
      where: { name: skills[i] },
      update: { progress: 20 + i * 10 },
      create: {
        name: skills[i],
        progress: 20 + i * 10,
        notes: "Seeded for Mission Control.",
        studyHours: i === 0 ? 6 : 4
      }
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
