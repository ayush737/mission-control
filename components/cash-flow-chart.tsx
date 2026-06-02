import { formatMoney } from "@/lib/finance";

export function CashFlowChart({
  points
}: {
  points: Array<{ label: string; cashFlow: number; remainingDebt: number }>;
}) {
  const maxAbs = Math.max(
    1,
    ...points.map((point) => Math.abs(point.cashFlow)),
    ...points.map((point) => Math.abs(point.remainingDebt))
  );

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {points.map((point) => {
          const flowHeight = `${(Math.abs(point.cashFlow) / maxAbs) * 100}%`;
          const debtHeight = `${(Math.abs(point.remainingDebt) / maxAbs) * 100}%`;
          return (
            <div key={point.label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-medium text-white">{point.label}</p>
                <p className={`text-sm ${point.cashFlow >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                  {formatMoney(point.cashFlow)}
                </p>
              </div>
              <div className="mt-4 flex h-40 items-end gap-4">
                <div className="flex-1">
                  <div className="h-full rounded-2xl bg-slate-950 p-2">
                    <div
                      className={`min-h-3 rounded-xl ${
                        point.cashFlow >= 0
                          ? "bg-gradient-to-t from-emerald-500 to-cyan-400"
                          : "bg-gradient-to-t from-rose-500 to-amber-400"
                      }`}
                      style={{ height: flowHeight }}
                    />
                  </div>
                  <p className="mt-2 text-center text-xs uppercase tracking-[0.25em] text-slate-500">Cash flow</p>
                </div>
                <div className="flex-1">
                  <div className="h-full rounded-2xl bg-slate-950 p-2">
                    <div
                      className="min-h-3 rounded-xl bg-gradient-to-t from-sky-500 to-indigo-400"
                      style={{ height: debtHeight }}
                    />
                  </div>
                  <p className="mt-2 text-center text-xs uppercase tracking-[0.25em] text-slate-500">
                    Debt left
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Remaining debt after this month: {formatMoney(point.remainingDebt)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
