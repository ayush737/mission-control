import { prisma } from "@/lib/prisma";
import { addDays, todayKey } from "@/lib/dates";

const PROFILE = {
  name: "Ayush",
  role: "SDET 2",
  emergencyFundTarget: 100000,
  currentEmergencyFund: 25000,
  totalDebt: 180000,
  monthlySalary: "XXXXX",
  targetCountry: "Germany",
  targetDate: "Dec 2027"
} as const;

function keyToDate(dayKey: string) {
  return new Date(`${dayKey}T00:00:00`);
}

function dateToKey(date: Date) {
  return todayKey(date);
}

function previousDayKey(dayKey: string) {
  return dateToKey(addDays(keyToDate(dayKey), -1));
}

async function getStudyStreakDays(endDateKey: string) {
  const logs = await prisma.studyLog.findMany({
    select: { dayKey: true },
    where: {
      dayKey: {
        lte: endDateKey
      }
    }
  });

  const activeDays = new Set(logs.map((entry) => entry.dayKey));
  let streak = 0;
  let cursor = endDateKey;

  while (activeDays.has(cursor)) {
    streak += 1;
    cursor = previousDayKey(cursor);
  }

  return streak;
}

async function completedGymYesterday(dayKey: string) {
  const yesterday = previousDayKey(dayKey);
  const gymHabit = await prisma.habit.findUnique({
    where: { name: "Gym" },
    include: {
      logs: {
        where: { dayKey: yesterday }
      }
    }
  });

  return gymHabit?.logs.some((log) => log.completed) ?? false;
}

function buildFinanceTasks() {
  const emergencyFundTask =
    PROFILE.currentEmergencyFund < PROFILE.emergencyFundTarget ? "Save money today" : "Keep building your emergency fund";
  const debtTask = PROFILE.totalDebt > 0 ? "Avoid unnecessary spending" : emergencyFundTask;

  return {
    primary: emergencyFundTask,
    secondary: debtTask
  };
}

function buildCareerTask(studyStreakDays: number) {
  if (studyStreakDays < 5) {
    return "Study 60 minutes";
  }

  return "Study one Senior SDET skill for 45 minutes";
}

function buildFitnessTask(gymCompletedYesterday: boolean) {
  if (!gymCompletedYesterday) {
    return "Go to gym for at least 45 minutes";
  }

  return "Do 20 minutes of mobility or a brisk walk";
}

function buildSocialTask() {
  return "Message one person who supports your goals";
}

function buildAvoidToday() {
  return "Instagram Scrolling";
}

function buildReflectionQuestion() {
  return `Did I move closer to becoming debt free and Germany-ready by Dec 2027 today?`;
}

export async function generateDailyMission(dayKey: string) {
  const studyStreakDays = await getStudyStreakDays(previousDayKey(dayKey));
  const gymCompletedYesterday = await completedGymYesterday(dayKey);

  const financeTasks = buildFinanceTasks();
  const careerTask = buildCareerTask(studyStreakDays);
  const fitnessTask = buildFitnessTask(gymCompletedYesterday);
  const socialTask = buildSocialTask();

  const topTasks = [financeTasks.primary, careerTask, fitnessTask, socialTask].filter(Boolean).slice(0, 3);

  return prisma.dailyMission.upsert({
    where: { date: dayKey },
    update: {},
    create: {
      date: dayKey,
      mission: "Win Today",
      topTask1: topTasks[0] ?? financeTasks.primary,
      topTask2: topTasks[1] ?? careerTask,
      topTask3: topTasks[2] ?? fitnessTask,
      fitnessTask,
      careerTask,
      financeTask: financeTasks.secondary,
      avoidToday: buildAvoidToday(),
      reflectionQuestion: buildReflectionQuestion(),
      completed: false
    }
  });
}

export async function ensureTodaysMission() {
  return generateDailyMission(todayKey());
}

export async function ensureMissionForTomorrow() {
  return generateDailyMission(dateToKey(addDays(new Date(), 1)));
}

export const dailyMissionProfile = PROFILE;
