import type { ReactNode } from "react";

function join(...parts: Array<string | false | undefined | null>) {
  return parts.filter(Boolean).join(" ");
}

export function Card({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={join(
        "rounded-3xl border border-slate-800/80 bg-slate-950/70 p-5 shadow-glow backdrop-blur",
        className
      )}
    >
      {children}
    </section>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow ? <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">{eyebrow}</p> : null}
        <h2 className="mt-1 text-xl font-semibold text-white">{title}</h2>
        {description ? <p className="mt-1 max-w-2xl text-sm text-slate-400">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  helper
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {helper ? <p className="mt-2 text-sm text-slate-400">{helper}</p> : null}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={join(
        "w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition",
        "placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25",
        props.className
      )}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={join(
        "w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition",
        "placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25",
        props.className
      )}
    />
  );
}

export function Button({
  children,
  className = "",
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const styles = {
    primary: "bg-cyan-400 text-slate-950 hover:bg-cyan-300",
    secondary: "bg-slate-800 text-white hover:bg-slate-700",
    ghost: "border border-slate-800 bg-transparent text-slate-200 hover:border-slate-600 hover:bg-slate-900",
    danger: "bg-rose-500 text-white hover:bg-rose-400"
  } as const;

  return (
    <button
      {...props}
      className={join(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        styles[variant],
        className
      )}
    >
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "neutral"
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "info";
}) {
  const tones = {
    neutral: "border-slate-700 bg-slate-900 text-slate-300",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    info: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
  } as const;

  return <span className={join("rounded-full border px-3 py-1 text-xs font-medium", tones[tone])}>{children}</span>;
}

export function ProgressBar({
  value,
  className = ""
}: {
  value: number;
  className?: string;
}) {
  return (
    <div className={join("h-2 overflow-hidden rounded-full bg-slate-800", className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
