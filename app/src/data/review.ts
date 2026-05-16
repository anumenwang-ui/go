import type { Task, MediaCard, Member, Inspiration } from "./types";
import { getMonthlyBudget, getUpcomingRenewals } from "./budget";

export interface ReviewStats {
  completedTasks: number;
  focusCompleted: number;
  focusTotal: number;
  focusRate: number; // 0-1
  typeDistribution: Record<Task["type"], number>;
  mediaPushed: number; // updated in range
  mediaCompleted: number;
  inspirationsCount: number;
  budget: number;
  upcomingRenewals: number;
}

export function computeReview(
  tasks: Task[],
  mediaCards: MediaCard[],
  inspirations: Inspiration[],
  members: Member[],
  start: string, // "YYYY-MM-DD"
  end: string,   // "YYYY-MM-DD"
): ReviewStats {
  // Tasks completed in range
  const completedInRange = tasks.filter(
    (t) => t.completed && t.completedAt && t.completedAt.slice(0, 10) >= start && t.completedAt.slice(0, 10) <= end
  );
  const focusInRange = completedInRange.filter((t) => t.isTodayFocus);

  // Type distribution
  const typeDist: Record<string, number> = { "生活杂事": 0, "长期目标": 0, "自我照顾": 0, "灵感收件箱": 0 };
  completedInRange.forEach((t) => {
    typeDist[t.type] = (typeDist[t.type] || 0) + 1;
  });

  // Media: pushed = updated in range, completed = status changed to 完成 in range
  const mediaUpdated = mediaCards.filter(
    (m) => m.updatedAt.slice(0, 10) >= start && m.updatedAt.slice(0, 10) <= end
  );
  const mediaDone = mediaCards.filter(
    (m) => m.status === "完成" && m.updatedAt.slice(0, 10) >= start && m.updatedAt.slice(0, 10) <= end
  );

  // Inspirations
  const inspsInRange = inspirations.filter((i) => i.date >= start && i.date <= end);

  // Budget: use the month of the end date
  const budgetMonth = end.slice(0, 7);
  const budget = getMonthlyBudget(members, budgetMonth);

  // Upcoming renewals in range
  const renewals = getUpcomingRenewals(members, 30).filter((m) => {
    const billDate = m.nextBillingDate;
    return billDate >= start && billDate <= end;
  });

  // Focus tasks that were eligible during this range
  const focusTotal = tasks.filter((t) => t.isTodayFocus).length;

  return {
    completedTasks: completedInRange.length,
    focusCompleted: focusInRange.length,
    focusTotal,
    focusRate: focusTotal > 0 ? focusInRange.length / focusTotal : 0,
    typeDistribution: typeDist as Record<Task["type"], number>,
    mediaPushed: mediaUpdated.length,
    mediaCompleted: mediaDone.length,
    inspirationsCount: inspsInRange.length,
    budget,
    upcomingRenewals: renewals.length,
  };
}

export function getWeekRange(): { start: string; end: string } {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  const monday = new Date(now.setDate(diff));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    start: monday.toISOString().slice(0, 10),
    end: sunday.toISOString().slice(0, 10),
  };
}

export function getMonthRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

export function getSummarySentence(stats: ReviewStats): string {
  if (stats.completedTasks === 0) {
    return "这段时间没有完成任务。给自己一些空间，重新出发。";
  }
  const parts: string[] = [];
  parts.push(`完成了 ${stats.completedTasks} 项任务`);
  if (stats.focusCompleted > 0) {
    parts.push(`其中 ${stats.focusCompleted} 项是焦点任务`);
  }
  if (stats.mediaCompleted > 0) {
    parts.push(`${stats.mediaCompleted} 个内容完结`);
  }
  if (stats.inspirationsCount > 0) {
    parts.push(`记录了 ${stats.inspirationsCount} 条灵感`);
  }
  if (stats.upcomingRenewals > 0) {
    parts.push(`${stats.upcomingRenewals} 项订阅即将续费`);
  }
  return parts.join("，") + "。";
}
