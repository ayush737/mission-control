import { prisma } from "@/lib/prisma";
import { buildCashFlowSeries, buildDebtSnowball, formatMoney, getDebtSources, toNumber } from "@/lib/finance";
import { CashFlowChart } from "@/components/cash-flow-chart";
import {
  addBill,
  addCreditCard,
  addEmi,
  deleteBill,
  deleteCreditCard,
  deleteEmi,
  toggleBill,
  updateAppConfig
} from "@/app/actions";
import { Badge, Button, Card, Input, SectionTitle, StatCard, Textarea } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const [config, snapshot, emis, creditCards, bills] = await Promise.all([
    prisma.appConfig.findUnique({ where: { id: "singleton" } }),
    prisma.moneySnapshot.findUnique({ where: { id: "singleton" } }),
    prisma.emi.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.creditCard.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.bill.findMany({ orderBy: { createdAt: "desc" } })
  ]);

  const debtSources = getDebtSources({
    emis,
    creditCards
  });

  const snowball = buildDebtSnowball({
    income: config?.monthlyIncome ?? 0,
    bills: toNumber(snapshot?.monthlyBills ?? 0),
    extraDebtPayment: config?.extraDebtPayment ?? 0,
    debts: debtSources
  });

  const cashFlowSeries = buildCashFlowSeries({
    income: config?.monthlyIncome ?? 0,
    bills: toNumber(snapshot?.monthlyBills ?? 0) + bills.filter((bill) => bill.active).reduce((sum, bill) => sum + Number(bill.amount), 0),
    extraDebtPayment: config?.extraDebtPayment ?? 0,
    debts: debtSources
  });

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-3">
        <StatCard label="Debt snowball target" value={snowball.firstDebt ? snowball.firstDebt.name : "No debt yet"} helper={snowball.firstDebt ? "Close this first." : "Add debts to generate a strategy."} />
        <StatCard label="Projected debt-free date" value={snowball.projectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} helper={`${snowball.monthsToDebtFree} month${snowball.monthsToDebtFree === 1 ? "" : "s"} at the current paydown rate.`} />
        <StatCard label="Monthly debt paydown" value={formatMoney(snowball.monthlyPaydown)} helper="Minimums plus extra debt payment." />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <SectionTitle eyebrow="Debt Snowball Strategy" title="Smallest balance first" description="This view sorts debts by balance so you can free up cash fast." />
          <div className="overflow-hidden rounded-3xl border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/70 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Debt</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Balance</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">APR/Interest</th>
                </tr>
              </thead>
              <tbody>
                {snowball.debtSources.map((debt, index) => (
                  <tr key={`${debt.kind}-${debt.name}`} className="border-t border-slate-800 bg-slate-950">
                    <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-white">{debt.name}</td>
                    <td className="px-4 py-3">
                      <Badge tone={debt.kind === "EMI" ? "info" : "warning"}>{debt.kind}</Badge>
                    </td>
                    <td className="px-4 py-3">{formatMoney(debt.balance)}</td>
                    <td className="px-4 py-3">{formatMoney(debt.monthlyPayment)}</td>
                    <td className="px-4 py-3">{debt.apr.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-slate-400">
            Strategy: put every extra dollar toward the smallest balance first while keeping all minimum payments current.
          </p>
        </Card>

        <Card>
          <SectionTitle eyebrow="Projection Settings" title="Make the forecast honest" description="Use your monthly income and extra debt payment to shape the debt-free date." />
          <form action={updateAppConfig} className="space-y-4">
            <label className="block text-sm text-slate-300">
              Monthly income
              <Input name="monthlyIncome" type="number" step="0.01" defaultValue={config?.monthlyIncome ?? 0} className="mt-2" />
            </label>
            <label className="block text-sm text-slate-300">
              Extra debt payment
              <Input name="extraDebtPayment" type="number" step="0.01" defaultValue={config?.extraDebtPayment ?? 0} className="mt-2" />
            </label>
            <label className="block text-sm text-slate-300">
              Mission context
              <Textarea name="currentFocusTask" rows={3} defaultValue={config?.currentFocusTask ?? ""} className="mt-2" />
            </label>
            <input type="hidden" name="mission" value={config?.mission ?? "Become Debt Free"} />
            <input type="hidden" name="missionProgress" value={String(config?.missionProgress ?? 0)} />
            <input type="hidden" name="weeklyWinGoal" value={config?.weeklyWinGoal ?? ""} />
            <Button type="submit" className="w-full">
              Save projection settings
            </Button>
          </form>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card>
          <SectionTitle eyebrow="Add EMI" title="Track installment debt" />
          <form action={addEmi} className="space-y-3">
            <Input name="name" placeholder="EMI name" />
            <Input name="amount" type="number" step="0.01" placeholder="Amount" />
            <Input name="interest" type="number" step="0.01" placeholder="Interest %" />
            <Input name="remainingMonths" type="number" min="1" step="1" placeholder="Remaining months" />
            <Button type="submit" className="w-full">
              Add EMI
            </Button>
          </form>
          <div className="mt-4 space-y-3">
            {emis.map((emi) => (
              <div key={emi.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{emi.name}</p>
                    <p className="text-sm text-slate-400">
                      {formatMoney(Number(emi.amount))} over {emi.remainingMonths} month{emi.remainingMonths === 1 ? "" : "s"}
                    </p>
                  </div>
                  <form action={deleteEmi}>
                    <input type="hidden" name="id" value={emi.id} />
                    <Button type="submit" variant="ghost">
                      Delete
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle eyebrow="Add Credit Card" title="Track revolving debt" />
          <form action={addCreditCard} className="space-y-3">
            <Input name="name" placeholder="Card name" />
            <Input name="balance" type="number" step="0.01" placeholder="Balance" />
            <Input name="apr" type="number" step="0.01" placeholder="APR %" />
            <Input name="minimumPayment" type="number" step="0.01" placeholder="Minimum payment" />
            <Button type="submit" className="w-full">
              Add card
            </Button>
          </form>
          <div className="mt-4 space-y-3">
            {creditCards.map((card) => (
              <div key={card.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{card.name}</p>
                    <p className="text-sm text-slate-400">
                      {formatMoney(Number(card.balance))} at {card.apr.toFixed(2)}% APR
                    </p>
                  </div>
                  <form action={deleteCreditCard}>
                    <input type="hidden" name="id" value={card.id} />
                    <Button type="submit" variant="ghost">
                      Delete
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle eyebrow="Track Bills" title="Fixed monthly outgo" />
          <form action={addBill} className="space-y-3">
            <Input name="name" placeholder="Bill name" />
            <Input name="amount" type="number" step="0.01" placeholder="Amount" />
            <Input name="dueDay" type="number" min="1" max="31" placeholder="Due day" />
            <Button type="submit" className="w-full">
              Add bill
            </Button>
          </form>
          <div className="mt-4 space-y-3">
            {bills.map((bill) => (
              <div key={bill.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{bill.name}</p>
                    <p className="text-sm text-slate-400">
                      {formatMoney(Number(bill.amount))} {bill.dueDay ? `due on day ${bill.dueDay}` : "no due day set"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <form action={toggleBill}>
                      <input type="hidden" name="id" value={bill.id} />
                      <input type="hidden" name="active" value={String(!bill.active)} />
                      <Button type="submit" variant={bill.active ? "secondary" : "primary"}>
                        {bill.active ? "Pause" : "Resume"}
                      </Button>
                    </form>
                    <form action={deleteBill}>
                      <input type="hidden" name="id" value={bill.id} />
                      <Button type="submit" variant="ghost">
                        Delete
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <SectionTitle eyebrow="Monthly Cash Flow" title="Forecast the next six months" description="The chart shows projected cash flow after bills and debt payments." />
          <CashFlowChart points={cashFlowSeries} />
        </Card>

        <Card>
          <SectionTitle eyebrow="Money Snapshot" title="Still visible here" description="The same five numbers from the dashboard, for quick finance checks." />
          <div className="grid gap-3">
            <StatCard label="Savings" value={formatMoney(toNumber(snapshot?.savings ?? 0))} />
            <StatCard label="Debt" value={formatMoney(toNumber(snapshot?.debt ?? 0))} />
            <StatCard label="EMIs" value={formatMoney(toNumber(snapshot?.emis ?? 0))} />
            <StatCard label="Monthly Bills" value={formatMoney(toNumber(snapshot?.monthlyBills ?? 0))} />
            <StatCard label="Net Worth" value={formatMoney(toNumber(snapshot?.netWorth ?? 0))} />
          </div>
        </Card>
      </section>
    </div>
  );
}
