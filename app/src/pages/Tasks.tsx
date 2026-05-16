import { useState } from "react";
import { useAppData, useTaskActions } from "../hooks/useAppData";
import { useToast } from "../hooks/useToast";
import { TaskCard } from "../components/TaskCard";
import { TaskForm } from "../components/TaskForm";
import { Plus, Search, X, Inbox } from "lucide-react";

type FilterTab = "全部" | "今日焦点" | "灵感收件箱" | "已完成";

const FILTERS: FilterTab[] = ["全部", "今日焦点", "灵感收件箱", "已完成"];

export function Tasks() {
  const { tasks } = useAppData();
  const { add, toggleComplete, toggleTodayFocus, remove } = useTaskActions();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<FilterTab>("全部");
  const [search, setSearch] = useState("");

  const filtered = tasks
    .filter((t) => {
      switch (filter) {
        case "今日焦点":
          return t.isTodayFocus && !t.completed;
        case "灵感收件箱":
          return t.type === "灵感收件箱";
        case "已完成":
          return t.completed;
        default:
          return true;
      }
    })
    .filter((t) => {
      if (!search.trim()) return true;
      return t.content.toLowerCase().includes(search.toLowerCase());
    })
    .sort((a, b) => {
      // Completed tasks to the bottom
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      // Then by importance
      const impOrder = { 高: 0, 中: 1, 低: 2 };
      return impOrder[a.importance] - impOrder[b.importance];
    });

  const inboxCount = tasks.filter((t) => t.type === "灵感收件箱" && !t.completed).length;
  const activeCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="page-shell space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-stone-800">任务</h1>
          <p className="text-xs text-stone-400">
            {activeCount} 个进行中
            {inboxCount > 0 && ` · ${inboxCount} 条灵感`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-stone-800 px-4 py-2 text-xs font-medium text-white transition-all hover:bg-stone-700"
        >
          <Plus size={14} />
          添加任务
        </button>
      </header>

      {/* Search + Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 text-2xs font-medium transition-all ${
                filter === f ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-500 hover:bg-stone-200"
              }`}
            >
              {f}
              {f === "灵感收件箱" && inboxCount > 0 && (
                <span className="ml-1 text-purple-300">{inboxCount}</span>
              )}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索任务..."
            className="w-full rounded-lg border border-stone-200 bg-white py-1.5 pl-8 pr-8 text-xs text-stone-800 placeholder:text-stone-400 focus:border-stone-300 focus:outline-none sm:w-48"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Add task form */}
      {showForm && (
        <div className="card">
          <TaskForm
            onSubmit={(content, type, importance) => {
              add(content, type, importance);
              setShowForm(false);
            }}
            onClose={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="card py-10 text-center">
          {filter === "灵感收件箱" ? (
            <>
              <Inbox size={32} className="mx-auto mb-3 text-stone-300" />
              <p className="text-sm text-stone-400">灵感收件箱还是空的</p>
              <p className="mt-1 text-2xs text-stone-400">随手记录一闪而过的想法，回头再来处理</p>
            </>
          ) : filter === "已完成" ? (
            <p className="text-sm text-stone-400">还没有已完成的任务</p>
          ) : (
            <p className="text-sm text-stone-400">
              {search ? "没有匹配的任务" : "还没有任务，点击上方按钮添加"}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={() => toggleComplete(task)}
              onToggleFocus={() => toggleTodayFocus(task)}
              onDelete={() => { remove(task.id); toast.show("任务已删除"); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
