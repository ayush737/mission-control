import { weekKey, startOfWeek } from "@/lib/dates";

export function buildWeeklyReview({
  currentWeekKey,
  habits,
  focusSessions,
  studyLogs,
  reviewNote
}: {
  currentWeekKey: string;
  habits: Array<{ name: string; logs: Array<{ dayKey: string; completed: boolean }> }>;
  focusSessions: Array<{ completedAt: Date; minutes: number; task: string }>;
  studyLogs: Array<{ hours: number; dayKey: string; skill: { name: string } }>;
  reviewNote?: { wins: string; losses: string } | null;
}) {
  const weekStart = startOfWeek();
  const weekEnd = new Date();
  weekEnd.setHours(23, 59, 59, 999);

  const weekFocusSessions = focusSessions.filter((session) => {
    const date = new Date(session.completedAt);
    return date >= weekStart && date <= weekEnd;
  });

  const weekStudyLogs = studyLogs.filter((entry) => entry.dayKey >= currentWeekKey);
  const studyHours = weekStudyLogs.reduce((sum, entry) => sum + entry.hours, 0);
  const gymSessions = habits
    .find((habit) => habit.name === "Gym")
    ?.logs.filter((log) => log.completed && log.dayKey >= currentWeekKey).length ?? 0;
  const noSpendDays = habits
    .find((habit) => habit.name === "No Spend Day")
    ?.logs.filter((log) => log.completed && log.dayKey >= currentWeekKey).length ?? 0;
  const focusScore = Math.min(
    100,
    Math.round(weekFocusSessions.length * 14 + studyHours * 4 + gymSessions * 10 + noSpendDays * 6)
  );

  const wins = [
    `Completed ${weekFocusSessions.length} focus session${weekFocusSessions.length === 1 ? "" : "s"}.`,
    `Logged ${studyHours.toFixed(1)} study hour${studyHours === 1 ? "" : "s"}.`,
    `Finished ${gymSessions} gym session${gymSessions === 1 ? "" : "s"}.`
  ];

  if (noSpendDays > 0) {
    wins.push(`Kept ${noSpendDays} no-spend day${noSpendDays === 1 ? "" : "s"}.`);
  }

  const losses = habits
    .filter((habit) => {
      const completed = habit.logs.filter((log) => log.completed && log.dayKey >= currentWeekKey).length;
      return completed === 0;
    })
    .map((habit) => `Missed the ${habit.name} habit this week.`);

  if (weekFocusSessions.length === 0) {
    losses.unshift("No focus sessions were logged yet.");
  }

  return {
    weekKey: weekKey(),
    wins: reviewNote?.wins ? [reviewNote.wins, ...wins] : wins,
    losses: reviewNote?.losses ? [reviewNote.losses, ...losses] : losses,
    moneySaved: noSpendDays * 25,
    studyHours,
    gymSessions,
    focusScore,
    weekStart,
    weekEnd
  };
}
