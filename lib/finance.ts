import { addMonths, formatShortDate } from "@/lib/dates";

type DebtSource = {
  name: string;
  balance: number;
  monthlyPayment: number;
  kind: "EMI" | "Card";
  apr: number;
};

type CashFlowInput = {
  income: number;
  bills: number;
  extraDebtPayment: number;
  debts: DebtSource[];
};

export function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(amount);
}

export function toNumber(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (value && typeof value === "object" && "toString" in value) {
    const parsed = Number.parseFloat(String(value));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export function getDebtSources({
  emis,
  creditCards
}: {
  emis: Array<{ name: string; amount: unknown; remainingMonths: number; interest: number }>;
  creditCards: Array<{ name: string; balance: unknown; minimumPayment: unknown; apr: number }>;
}) {
  const sources: DebtSource[] = [
    ...emis.map((item) => ({
      name: item.name,
      kind: "EMI" as const,
      balance: toNumber(item.amount) * Math.max(item.remainingMonths, 1),
      monthlyPayment: toNumber(item.amount),
      apr: item.interest
    })),
    ...creditCards.map((item) => ({
      name: item.name,
      kind: "Card" as const,
      balance: toNumber(item.balance),
      monthlyPayment: toNumber(item.minimumPayment),
      apr: item.apr
    }))
  ];

  return sources.sort((left, right) => left.balance - right.balance || right.apr - left.apr);
}

export function buildDebtSnowball(input: CashFlowInput) {
  const debtSources = [...input.debts].sort((left, right) => left.balance - right.balance || right.apr - left.apr);
  const baseMonthlyPayment = debtSources.reduce((sum, debt) => sum + debt.monthlyPayment, 0);
  const totalDebt = debtSources.reduce((sum, debt) => sum + debt.balance, 0);
  const monthlyPaydown = Math.max(1, baseMonthlyPayment + input.extraDebtPayment);
  const monthsToDebtFree = Math.ceil(totalDebt / monthlyPaydown);
  const projectedDate = addMonths(new Date(), monthsToDebtFree);
  const firstDebt = debtSources[0] ?? null;

  return {
    debtSources,
    totalDebt,
    monthlyPaydown,
    monthsToDebtFree,
    projectedDate,
    firstDebt
  };
}

export function buildCashFlowSeries(input: CashFlowInput) {
  const debts = input.debts.map((debt) => ({ ...debt }));
  const months: Array<{
    label: string;
    cashFlow: number;
    remainingDebt: number;
  }> = [];
  let currentDate = new Date();

  for (let month = 0; month < 6; month += 1) {
    const activeDebts = debts.filter((debt) => debt.balance > 0);
    const scheduledDebtPayments =
      activeDebts.reduce((sum, debt) => sum + debt.monthlyPayment, 0) + input.extraDebtPayment;
    const cashFlow = input.income - input.bills - scheduledDebtPayments;
    const debtAfterPayment = activeDebts.reduce((sum, debt) => sum + Math.max(0, debt.balance - debt.monthlyPayment), 0);

    months.push({
      label: formatShortDate(currentDate),
      cashFlow,
      remainingDebt: debtAfterPayment
    });

    let extra = input.extraDebtPayment;
    debts.sort((left, right) => left.balance - right.balance || right.apr - left.apr);
    for (const debt of debts) {
      if (debt.balance <= 0) continue;
      const payment = debt.monthlyPayment + extra;
      debt.balance = Math.max(0, debt.balance - payment);
      extra = Math.max(0, payment - debt.monthlyPayment);
      if (debt.balance > 0) break;
    }

    currentDate = addMonths(currentDate, 1);
  }

  return months;
}
