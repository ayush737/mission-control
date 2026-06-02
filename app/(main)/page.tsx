import { prisma } from "@/lib/prisma";
import { todayKey } from "@/lib/dates";
import { formatMoney, toNumber } from "@/lib/finance";
import { dailyMissionProfile, ensureTodaysMission } from "@/lib/daily-mission";
import {
  addBigThreeTask,
  deleteBigThreeTask,
  toggleDailyMissionCompletion,
  toggleBigThreeTask,
  toggleHabit,
  updateAppConfig,
  updateMoneySnapshot
} from "@/app/actions";
import { Badge, Button, Card, Input, ProgressBar, SectionTitle, StatCard, Textarea } from "@/components/ui";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const todayMission = await ensureTodaysMission();
  const [config, snapshot, habits, skills, bigThreeTasks] = await Promise.all([
    prisma.appConfig.findUnique({ where: { id: "singleton" } }),
    prisma.moneySnapshot.findUnique({ where: { id: "singleton" } }),
    prisma.habit.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        logs: {
          where: { dayKey: todayKey() }
        }
      }
    }),
    prisma.skill.findMany({ orderBy: { name: "asc" } }),
    prisma.bigThreeTask.findMany({
      where: { dayKey: todayKey() },
      orderBy: { position: "asc" }
    })
  ]);

  const missionProgress = config?.missionProgress ?? 0;
  const remainingSlots = Math.max(0, 3 - bigThreeTasks.length);

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.1),transparent_25%)]" />
          <div className="relative">
            <SectionTitle
              eyebrow="Today's Mission"
              title={todayMission.mission}
              description="Your automatic daily plan is generated from your current money, career, and fitness situation."
            />

            <div className="grid gap-4 md:grid-cols-2">
              <StatCard label="Date" value={todayMission.date} helper="Generated for today when you opened the dashboard." />
              <StatCard label="Status" value={todayMission.completed ? "Completed" : "In progress"} helper={todayMission.completed ? "Nice work." : "Still open."} />
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Top Task 1</p>
                <p className="mt-2 text-lg font-medium text-white">{todayMission.topTask1}</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Top Task 2</p>
                <p className="mt-2 text-lg font-medium text-white">{todayMission.topTask2}</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Top Task 3</p>
                <p className="mt-2 text-lg font-medium text-white">{todayMission.topTask3}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">Finance Task</p>
                <p className="mt-2 text-base text-white">{todayMission.financeTask}</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">Career Task</p>
                <p className="mt-2 text-base text-white">{todayMission.careerTask}</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">Fitness Task</p>
                <p className="mt-2 text-base text-white">{todayMission.fitnessTask}</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">Avoid Today</p>
                <p className="mt-2 text-base text-white">{todayMission.avoidToday}</p>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Reflection question</p>
              <p className="mt-2 text-base text-white">{todayMission.reflectionQuestion}</p>
            </div>

            <form action={toggleDailyMissionCompletion} className="mt-6 flex flex-wrap items-center gap-3">
              <input type="hidden" name="date" value={todayMission.date} />
              <input type="hidden" name="completed" value={String(!todayMission.completed)} />
              <Button type="submit" variant={todayMission.completed ? "secondary" : "primary"}>
                {todayMission.completed ? "Mark incomplete" : "Mark complete"}
              </Button>
              <Badge tone={todayMission.completed ? "success" : "warning"}>
                {todayMission.completed ? "Completed" : "Not complete"}
              </Badge>
            </form>
          </div>
        </Card>

        <Card>
          <SectionTitle
            eyebrow="User Profile"
            title="Mission context"
            description="The daily generator is tailored to your current situation and future goal."
          />
          <div className="grid gap-3">
            <StatCard label="Name" value={dailyMissionProfile.name} />
            <StatCard label="Role" value={dailyMissionProfile.role} />
            <StatCard label="Emergency Fund Target" value={`₹${dailyMissionProfile.emergencyFundTarget.toLocaleString("en-IN")}`} />
            <StatCard label="Current Emergency Fund" value={`₹${dailyMissionProfile.currentEmergencyFund.toLocaleString("en-IN")}`} />
            <StatCard label="Total Debt" value={`₹${dailyMissionProfile.totalDebt.toLocaleString("en-IN")}`} />
            <StatCard label="Monthly Salary" value={`₹${dailyMissionProfile.monthlySalary}`} />
            <StatCard label="Target Country" value={dailyMissionProfile.targetCountry} />
            <StatCard label="Target Date" value={dailyMissionProfile.targetDate} />
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.15),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_25%)]" />
          <div className="relative">
            <SectionTitle
              eyebrow="Current Mission"
              title={config?.mission ?? "Become Debt Free"}
              description="A self-hosted command center for money, skills, energy, and execution."
            />

            <div className="grid gap-4 md:grid-cols-3">
              <StatCard
                label="Progress %"
                value={`${missionProgress}%`}
                helper="Track the long arc of the mission."
              />
              <StatCard
                label="Big Three Slots"
                value={`${bigThreeTasks.length}/3`}
                helper={remainingSlots > 0 ? `${remainingSlots} open slot${remainingSlots === 1 ? "" : "s"} left today.` : "Big Three is full."}
              />
              <StatCard
                label="Focus Task"
                value={(config?.currentFocusTask ?? "Choose the next task").slice(0, 28)}
                helper="Keep one thing in the crosshairs."
              />
            </div>

            <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white">Mission progress</p>
                  <p className="mt-1 text-sm text-slate-400">{missionProgress}% complete</p>
                </div>
                <Badge tone="info">{config?.weeklyWinGoal ?? "Keep the streak alive."}</Badge>
              </div>
              <ProgressBar value={missionProgress} className="mt-4" />
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle eyebrow="Mission Settings" title="Update the story" description="Adjust the mission, progress, and finance settings without leaving the dashboard." />
          <form action={updateAppConfig} className="space-y-4">
            <label className="block text-sm text-slate-300">
              Mission
              <Input name="mission" defaultValue={config?.mission ?? ""} className="mt-2" />
            </label>
            <label className="block text-sm text-slate-300">
              Progress %
              <Input name="missionProgress" type="number" min="0" max="100" defaultValue={missionProgress} className="mt-2" />
            </label>
            <label className="block text-sm text-slate-300">
              Monthly income
              <Input name="monthlyIncome" type="number" min="0" step="0.01" defaultValue={config?.monthlyIncome ?? 0} className="mt-2" />
            </label>
            <label className="block text-sm text-slate-300">
              Extra debt payment
              <Input name="extraDebtPayment" type="number" min="0" step="0.01" defaultValue={config?.extraDebtPayment ?? 0} className="mt-2" />
            </label>
            <label className="block text-sm text-slate-300">
              Current focus task
              <Textarea name="currentFocusTask" rows={3} defaultValue={config?.currentFocusTask ?? ""} className="mt-2" />
            </label>
            <label className="block text-sm text-slate-300">
              Weekly win goal
              <Input name="weeklyWinGoal" defaultValue={config?.weeklyWinGoal ?? ""} className="mt-2" />
            </label>
            <Button type="submit" className="w-full">
              Save mission settings
            </Button>
          </form>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <SectionTitle
            eyebrow="Today's Big Three"
            title="Only three tasks"
            description="Keep the day brutally focused. No more than three tasks are allowed."
            action={<Badge tone={remainingSlots > 0 ? "warning" : "success"}>{remainingSlots} slot{remainingSlots === 1 ? "" : "s"} left</Badge>}
          />

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {bigThreeTasks.map((task) => (
              <div key={task.id} className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Task {task.position + 1}</p>
                    <p className="mt-2 text-base font-medium text-white">{task.title}</p>
                  </div>
                  <Badge tone={task.completed ? "success" : "warning"}>{task.completed ? "Done" : "Open"}</Badge>
                </div>
                <div className="mt-4 flex gap-2">
                  <form action={toggleBigThreeTask}>
                    <input type="hidden" name="id" value={task.id} />
                    <input type="hidden" name="completed" value={String(!task.completed)} />
                    <Button type="submit" variant="secondary">
                      {task.completed ? "Reopen" : "Mark done"}
                    </Button>
                  </form>
                  <form action={deleteBigThreeTask}>
                    <input type="hidden" name="id" value={task.id} />
                    <Button type="submit" variant="ghost">
                      Remove
                    </Button>
                  </form>
                </div>
              </div>
            ))}

            {remainingSlots > 0 ? (
              <form action={addBigThreeTask} className="rounded-3xl border border-dashed border-cyan-400/40 bg-cyan-400/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">Add task</p>
                <Input name="title" placeholder="What must get done today?" className="mt-3" />
                <Button type="submit" className="mt-3 w-full">
                  Add to Big Three
                </Button>
              </form>
            ) : (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-400">
                The Big Three is full. Finish one before adding another.
              </div>
            )}
          </div>
        </Card>

        <Card>
          <SectionTitle eyebrow="Money Snapshot" title="Current balance sheet" description="A fast read on the financial picture." />
          <div className="grid gap-3">
            <StatCard label="Savings" value={formatMoney(toNumber(snapshot?.savings ?? 0))} />
            <StatCard label="Debt" value={formatMoney(toNumber(snapshot?.debt ?? 0))} />
            <StatCard label="EMIs" value={formatMoney(toNumber(snapshot?.emis ?? 0))} />
            <StatCard label="Monthly Bills" value={formatMoney(toNumber(snapshot?.monthlyBills ?? 0))} />
            <StatCard label="Net Worth" value={formatMoney(toNumber(snapshot?.netWorth ?? 0))} />
          </div>

          <form action={updateMoneySnapshot} className="mt-6 space-y-3">
            <p className="text-sm font-medium text-white">Update snapshot</p>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block text-sm text-slate-300">
                Savings
                <Input name="savings" type="number" step="0.01" defaultValue={String(snapshot?.savings ?? 0)} className="mt-2" />
              </label>
              <label className="block text-sm text-slate-300">
                Debt
                <Input name="debt" type="number" step="0.01" defaultValue={String(snapshot?.debt ?? 0)} className="mt-2" />
              </label>
              <label className="block text-sm text-slate-300">
                EMIs
                <Input name="emis" type="number" step="0.01" defaultValue={String(snapshot?.emis ?? 0)} className="mt-2" />
              </label>
              <label className="block text-sm text-slate-300">
                Monthly Bills
                <Input name="monthlyBills" type="number" step="0.01" defaultValue={String(snapshot?.monthlyBills ?? 0)} className="mt-2" />
              </label>
              <label className="block text-sm text-slate-300 md:col-span-2">
                Net Worth
                <Input name="netWorth" type="number" step="0.01" defaultValue={String(snapshot?.netWorth ?? 0)} className="mt-2" />
              </label>
            </div>
            <Button type="submit" className="w-full">
              Save snapshot
            </Button>
          </form>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <SectionTitle eyebrow="Habit Tracker" title="Daily rhythm" description="Track the habits that keep the mission alive." />
          <div className="space-y-3">
            {habits.map((habit) => {
              const todayLog = habit.logs[0];
              const completed = todayLog?.completed ?? false;
              return (
                <form key={habit.id} action={toggleHabit} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
                  <input type="hidden" name="habitId" value={habit.id} />
                  <input type="hidden" name="dayKey" value={todayKey()} />
                  <input type="hidden" name="completed" value={String(!completed)} />
                  <div>
                    <p className="font-medium text-white">{habit.name}</p>
                    <p className="text-xs text-slate-500">{completed ? "Completed today" : "Still open today"}</p>
                  </div>
                  <Button type="submit" variant={completed ? "secondary" : "primary"}>
                    {completed ? "Undo" : "Done"}
                  </Button>
                </form>
              );
            })}
          </div>
        </Card>

        <Card>
          <SectionTitle eyebrow="Study Tracker" title="Skills that compound" description="Use the same skill map across the home and career pages." action={<Link href="/career" className="text-sm text-cyan-300 hover:text-cyan-200">Open career page</Link>} />

          <div className="space-y-4">
            {skills.map((skill) => (
              <div key={skill.id} className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{skill.name}</p>
                    <p className="mt-1 text-sm text-slate-400">{skill.studyHours.toFixed(1)} study hours logged</p>
                  </div>
                  <Badge tone="info">{skill.progress}%</Badge>
                </div>
                <ProgressBar value={skill.progress} className="mt-4" />
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
