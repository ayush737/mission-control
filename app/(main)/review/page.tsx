import { prisma } from "@/lib/prisma";
import { buildWeeklyReview } from "@/lib/reports";
import { weekKey } from "@/lib/dates";
import { Card, SectionTitle, StatCard } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function WeeklyReviewPage() {
  const [habits, focusSessions, studyLogs, reviewNote, config] = await Promise.all([
    prisma.habit.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        logs: true
      }
    }),
    prisma.focusSession.findMany({ orderBy: { completedAt: "desc" } }),
    prisma.studyLog.findMany({
      orderBy: { createdAt: "desc" },
      include: { skill: true }
    }),
    prisma.reviewNote.findUnique({ where: { weekKey: weekKey() } }),
    prisma.appConfig.findUnique({ where: { id: "singleton" } })
  ]);

  const review = buildWeeklyReview({
    currentWeekKey: weekKey(),
    habits,
    focusSessions,
    studyLogs,
    reviewNote
  });

  return (
    <div className="space-y-8">
      <Card>
        <SectionTitle eyebrow="Weekly Review" title="The full scorecard" description="Use this as the weekly reset before the next push." />
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Money Saved" value={`$${review.moneySaved.toFixed(0)}`} helper="Estimated from no-spend days." />
          <StatCard label="Hours Studied" value={review.studyHours.toFixed(1)} />
          <StatCard label="Gym Sessions" value={String(review.gymSessions)} />
          <StatCard label="Focus Score" value={`${review.focusScore}/100`} />
        </div>
      </Card>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle eyebrow="Wins" title="What moved forward" description={`Week of ${review.weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} to ${review.weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}.`} />
          <ul className="space-y-3 text-sm text-slate-300">
            {review.wins.map((item) => (
              <li key={item} className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                {item}
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <SectionTitle eyebrow="Losses" title="What needs repair" description="Treat these as useful signals, not judgments." />
          <ul className="space-y-3 text-sm text-slate-300">
            {review.losses.length > 0 ? review.losses.map((item) => (
              <li key={item} className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
                {item}
              </li>
            )) : (
              <li className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-slate-400">
                No losses were detected this week.
              </li>
            )}
          </ul>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle eyebrow="Mission" title={config?.mission ?? "Become Debt Free"} description="The weekly review stays anchored to the mission." />
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Mission progress</p>
            <p className="mt-3 text-4xl font-semibold text-white">{config?.missionProgress ?? 0}%</p>
            <p className="mt-3 text-sm text-slate-400">{config?.weeklyWinGoal ?? "Keep the streak alive."}</p>
          </div>
        </Card>

        <Card>
          <SectionTitle eyebrow="Habit recap" title="Consistency check" description="These habits drive the longer arc of the mission." />
          <div className="space-y-3">
            {habits.map((habit) => {
              const completed = habit.logs.filter((log) => log.completed && log.dayKey >= weekKey()).length;
              return (
                <div key={habit.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-white">{habit.name}</p>
                    <p className="text-sm text-slate-400">{completed} completion{completed === 1 ? "" : "s"}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>
    </div>
  );
}
