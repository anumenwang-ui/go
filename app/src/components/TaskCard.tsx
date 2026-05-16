import { Circle, CircleCheck, Star, Trash2 } from "lucide-react";
import type { Task } from "../data/types";

const TYPE_BADGE: Record<Task["type"], string> = {
  "生活杂事": "bg-stone-100 text-stone-600",
  "长期目标": "bg-amber-50 text-amber-700",
  "自我照顾": "bg-green-50 text-green-700",
  "灵感收件箱": "bg-purple-50 text-purple-700",
};

const IMPORTANCE_DOT: Record<Task["importance"], string> = {
  "高": "bg-amber-400",
  "中": "bg-stone-300",
  "低": "bg-stone-200",
};

export function TaskCard({
  task,
  onToggle,
  onToggleFocus,
  onDelete,
}: {
  task: Task;
  onToggle: () => void;
  onToggleFocus: () => void;
  onDelete?: () => void;
}) {
  return (
    <div
      className={`group flex items-start gap-3 rounded-lg border px-3.5 py-3 transition-all ${
        task.completed
          ? "border-stone-100 bg-stone-50/50 opacity-60"
          : task.importance === "高"
            ? "border-stone-200 bg-white shadow-sm"
            : "border-stone-100 bg-white"
      }`}
    >
      {/* Complete toggle */}
      <button
        type="button"
        onClick={onToggle}
        className="mt-0.5 shrink-0 text-stone-400 hover:text-stone-600 transition-colors"
      >
        {task.completed ? (
          <CircleCheck size={18} className="text-green-500" />
        ) : (
          <Circle size={18} />
        )}
      </button>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm leading-relaxed ${
            task.completed ? "text-stone-400 line-through" : "text-stone-700"
          }`}
        >
          {task.content}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className={`badge ${TYPE_BADGE[task.type]}`}>{task.type}</span>
          <span className="inline-flex items-center gap-0.5 text-2xs text-stone-400">
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${IMPORTANCE_DOT[task.importance]}`} />
            {task.importance}
          </span>
        </div>
      </div>

      {/* Focus toggle */}
      <button
        type="button"
        onClick={onToggleFocus}
        className={`shrink-0 transition-all ${
          task.isTodayFocus
            ? "text-amber-400 hover:text-amber-500"
            : "text-stone-300 hover:text-stone-500 opacity-0 group-hover:opacity-100"
        }`}
        title={task.isTodayFocus ? "移出今日焦点" : "加入今日焦点"}
      >
        <Star size={16} fill={task.isTodayFocus ? "currentColor" : "none"} />
      </button>

      {/* Delete */}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="shrink-0 text-stone-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
          title="删除任务"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}
