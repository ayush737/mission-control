import { prisma } from "@/lib/prisma";
import { buildWeeklyReview } from "@/lib/reports";
import { weekKey } from "@/lib/dates";
import { saveReviewNote, updateSkill } from "@/app/actions";
import { Badge, Button, Card, Input, ProgressBar, SectionTitle, StatCard, Textarea } from "@/components/ui";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CareerPage() {
  const [skills, habitData, focusSessions, studyLogs, reviewNote, config] = await Promise.all([
    prisma.skill.findMany({ orderBy: { name: "asc" } }),
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
    habits: habitData,
    focusSessions,
    studyLogs,
    reviewNote
  });

  const topSkill = [...skills].sort((left, right) => right.progress - left.progress)[0];

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-3">
        <StatCard label="Study Hours" value={review.studyHours.toFixed(1)} helper="This week, across all tracked skills." />
        <StatCard label="Focus Sessions" value={String(focusSessions.length)} helper="Logged through focus mode." />
        <StatCard label="Top Skill" value={topSkill?.name ?? "None yet"} helper={`${topSkill?.progress ?? 0}% progress`} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <SectionTitle eyebrow="Skills" title="Career progression" description="Update skill progress, notes, and study hours in one place." action={<Link href="/focus" className="text-sm text-cyan-300 hover:text-cyan-200">Jump to focus mode</Link>} />
          <div className="space-y-4">
            {skills.map((skill) => (
              <form key={skill.id} action={updateSkill} className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                <input type="hidden" name="id" value={skill.id} />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{skill.name}</h3>
                    <p className="text-sm text-slate-400">{skill.studyHours.toFixed(1)} total study hours</p>
                  </div>
                  <Badge tone="info">{skill.progress}%</Badge>
                </div>
                <ProgressBar value={skill.progress} className="mt-4" />

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <label className="block text-sm text-slate-300">
                    Progress
                    <Input name="progress" type="number" min="0" max="100" defaultValue={skill.progress} className="mt-2" />
                  </label>
                  <label className="block text-sm text-slate-300">
                    Add hours
                    <Input name="hoursIncrement" type="number" min="0" step="0.25" placeholder="0" className="mt-2" />
                  </label>
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 text-sm text-slate-400">
                    Save progress and log a study session in one update.
                  </div>
                </div>

                <label className="mt-3 block text-sm text-slate-300">
                  Notes
                  <Textarea name="notes" rows={3} defaultValue={skill.notes} className="mt-2" placeholder="What did you learn or need to revisit?" />
                </label>

                <div className="mt-4 flex justify-end">
                  <Button type="submit">Save skill update</Button>
                </div>
              </form>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <SectionTitle eyebrow="Weekly Report" title="Auto-generated from your week" description="Wins, losses, focus, gym, and money are summarized here." />
            <div className="grid gap-3 md:grid-cols-2">
              <StatCard label="Money Saved" value={`$${review.moneySaved.toFixed(0)}`} helper="Estimated from no-spend days." />
              <StatCard label="Gym Sessions" value={String(review.gymSessions)} />
              <StatCard label="Focus Score" value={`${review.focusScore}/100`} />
              <StatCard label="Mission" value={config?.mission ?? "Become Debt Free"} />
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/70">Wins</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-300">
                  {review.wins.map((item) => (
                    <li key={item} className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-rose-300/70">Losses</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-300">
                  {review.losses.length > 0 ? review.losses.map((item) => (
                    <li key={item} className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-3">
                      {item}
                    </li>
                  )) : (
                    <li className="rounded-2xl border border-slate-800 bg-slate-900/50 p-3 text-slate-400">
                      No obvious losses. Keep going.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </Card>

          <Card>
            <SectionTitle eyebrow="Weekly Reflection" title="Keep your own notes too" description="Optional manual notes are saved and merged into the weekly review." />
            <form action={saveReviewNote} className="space-y-3">
              <label className="block text-sm text-slate-300">
                Wins note
                <Textarea name="wins" rows={4} defaultValue={reviewNote?.wins ?? ""} className="mt-2" placeholder="What went well this week?" />
              </label>
              <label className="block text-sm text-slate-300">
                Losses note
                <Textarea name="losses" rows={4} defaultValue={reviewNote?.losses ?? ""} className="mt-2" placeholder="What got in the way?" />
              </label>
              <Button type="submit" className="w-full">
                Save reflection
              </Button>
            </form>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle eyebrow="Study Log" title="Recent learning sessions" description="These feed the weekly report and the career totals." />
          <div className="space-y-3">
            {studyLogs.slice(0, 8).map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{entry.skill.name}</p>
                    <p className="text-sm text-slate-400">{entry.dayKey}</p>
                  </div>
                  <Badge tone="info">{entry.hours.toFixed(1)}h</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle eyebrow="Career Goals" title="One-line focus" description="Keep the mission aligned with the next opportunity." />
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Current focus task</p>
            <p className="mt-3 text-lg text-white">{config?.currentFocusTask ?? "Choose the next meaningful task."}</p>
          </div>
          <div className="mt-4 rounded-3xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Suggested next move</p>
            <p className="mt-3 text-sm text-slate-300">
              Put one hour into the highest leverage skill, then capture one note about what you learned.
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}
