export function pad(value: number) {
  return value.toString().padStart(2, "0");
}

export function todayKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function weekKey(date = new Date()) {
  const start = startOfWeek(date);
  return todayKey(start);
}

export function startOfWeek(date = new Date()) {
  const clone = new Date(date);
  const day = clone.getDay();
  const delta = day === 0 ? 6 : day - 1;
  clone.setHours(0, 0, 0, 0);
  clone.setDate(clone.getDate() - delta);
  return clone;
}

export function addDays(date: Date, days: number) {
  const clone = new Date(date);
  clone.setDate(clone.getDate() + days);
  return clone;
}

export function addMonths(date: Date, months: number) {
  const clone = new Date(date);
  clone.setMonth(clone.getMonth() + months);
  return clone;
}

export function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(date);
}

export function formatLongDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}
