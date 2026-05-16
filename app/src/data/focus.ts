import type { Task, EnergyLevel } from "./types";

const MAX_COUNT: Record<EnergyLevel, number> = { 低: 3, 正常: 5, 高: 7 };

export function computeTodayFocus(tasks: Task[], energyLevel: EnergyLevel): Task[] {
  const incomplete = tasks.filter((t) => !t.completed);
  const max = MAX_COUNT[energyLevel];

  const scored = incomplete.map((t) => {
    let score = 0;

    // Today-focus-flagged tasks get top priority
    if (t.isTodayFocus) score += 10;

    // Importance weighting
    if (t.importance === "高") score += 5;
    else if (t.importance === "中") score += 2;

    // In low-energy mode, self-care tasks get a mild boost
    if (energyLevel === "低" && t.type === "自我照顾") score += 3;

    // Inspiration inbox is excluded from focus unless manually flagged
    if (t.type === "灵感收件箱" && !t.isTodayFocus) score = -1;

    return { task: t, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.filter((s) => s.score > 0).slice(0, max).map((s) => s.task);
}

export function getEmptyFocusMessage(energyLevel: EnergyLevel): string {
  switch (energyLevel) {
    case "低":
      return "今天只需专注几件小事就好。";
    case "正常":
      return "今天还没有焦点任务，添加一个吧。";
    case "高":
      return "今天精力充沛，来规划几件重要的事吧。";
  }
}

export function getEnergyDescription(level: EnergyLevel): string {
  switch (level) {
    case "低":
      return "今天聚焦 3 件小事就好";
    case "正常":
      return "今天聚焦最多 5 件事";
    case "高":
      return "今天可以处理最多 7 件事";
  }
}
