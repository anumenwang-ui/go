import type { Member } from "./types";

export function getMonthlyBudget(members: Member[], month?: string): number {
  const target = month ?? new Date().toISOString().slice(0, 7); // "YYYY-MM"
  return members
    .filter((m) => m.enabled)
    .filter((m) => isBillingInMonth(m, target))
    .reduce((sum, m) => sum + m.amount, 0);
}

export function getUpcomingRenewals(members: Member[], days: number = 30): Member[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() + days);

  return members
    .filter((m) => m.enabled)
    .filter((m) => {
      const d = new Date(m.nextBillingDate + "T00:00:00");
      return d >= today && d <= cutoff;
    })
    .sort((a, b) => a.nextBillingDate.localeCompare(b.nextBillingDate));
}

export function getDaysUntilBilling(nextDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(nextDate + "T00:00:00");
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function isBillingInMonth(member: Member, month: string): boolean {
  const date = member.nextBillingDate; // "YYYY-MM-DD"
  switch (member.billingCycle) {
    case "每月":
      return true; // monthly always counts
    case "每年":
      return date.slice(0, 7) === month; // only in renewal month
    case "自定义":
      return date.slice(0, 7) === month;
  }
}
