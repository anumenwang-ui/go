import { useState, useMemo } from "react";
import { useAppData, useTaskActions, useEnergyActions, useVocabularyActions } from "../hooks/useAppData";
import { useToast } from "../hooks/useToast";
import { EnergySelector } from "../components/EnergySelector";
import { TaskCard } from "../components/TaskCard";
import { computeTodayFocus, getEmptyFocusMessage } from "../data/focus";
import type { EnergyLevel, Task } from "../data/types";
import { getMonthlyBudget, getUpcomingRenewals } from "../data/budget";
import { Plus, ChevronRight, BookOpen, Trash2, Circle, CircleCheck, Star } from "lucide-react";
import { Link } from "react-router-dom";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "早上好";
  if (h < 18) return "下午好";
  return "晚上好";
}

function formatDate(): string {
  const now = new Date();
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const w = weekdays[now.getDay()];
  return `${m}月${d}日 星期${w}`;
}

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

const TYPE_BADGE: Record<string, string> = {
  "生活杂事": "bg-stone-100 text-stone-600",
  "长期目标": "bg-amber-50 text-amber-700",
  "自我照顾": "bg-green-50 text-green-700",
  "灵感收件箱": "bg-purple-50 text-purple-700",
};

const IMPORTANCE_DOT: Record<string, string> = {
  "高": "bg-amber-400",
  "中": "bg-stone-300",
  "低": "bg-stone-200",
};

export function Dashboard() {
  const { tasks, todayEnergy, englishMaterials, members, vocabularies } = useAppData();
  const { add, toggleComplete, toggleTodayFocus, remove } = useTaskActions();
  const { setEnergy } = useEnergyActions();
  const { add: addWord, remove: removeWord } = useVocabularyActions();
  const toast = useToast();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickContent, setQuickContent] = useState("");
  const [quickType, setQuickType] = useState<Task["type"]>("生活杂事");
  const [quickImportance, setQuickImportance] = useState<Task["importance"]>("中");
  const [newWord, setNewWord] = useState("");
  const [newWordTrans, setNewWordTrans] = useState("");

  const energyLevel: EnergyLevel = todayEnergy?.level ?? "正常";
  const focusTasks = computeTodayFocus(tasks, energyLevel);
  const completedToday = tasks.filter((t) => t.completed);
  const focusCompleted = focusTasks.filter((t) => t.completed);

  const todayEnglish = useMemo(() => {
    if (englishMaterials.length === 0) return null;
    const today = getTodayKey();
    const idx = hashDateToIndex(today, englishMaterials.length);
    return englishMaterials[idx];
  }, [englishMaterials]);

  const recentWords = useMemo(
    () => [...vocabularies].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
    [vocabularies]
  );

  const handleQuickAdd = () => {
    const trimmed = quickContent.trim();
    if (!trimmed) return;
    add(trimmed, quickType, quickImportance);
    toast.show("任务已添加");
    setQuickContent("");
    setQuickType("生活杂事");
    setQuickImportance("中");
    setQuickAddOpen(false);
  };

  const handleAddWord = () => {
    const w = newWord.trim();
    const t = newWordTrans.trim();
    if (!w || !t) return;
    addWord(w, t);
    toast.show(`已记录：${w}`);
    setNewWord("");
    setNewWordTrans("");
  };

  return (
    <div className="page-shell space-y-8">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-stone-400">{formatDate()}</p>
          <h1 className="mt-1 text-2xl font-medium text-stone-800">{getGreeting()}</h1>
        </div>
        <EnergySelector current={energyLevel} onChange={setEnergy} />
      </header>

      {/* Today Focus */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-stone-600">今日焦点</h2>
          <span className="text-2xs text-stone-400">
            {focusCompleted.length}/{focusTasks.length}
          </span>
        </div>

        {focusTasks.length === 0 ? (
          <div className="card py-8 text-center">
            <p className="text-sm text-stone-400">{getEmptyFocusMessage(energyLevel)}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {focusTasks.map((task, i) =>
              i === 0 ? (
                <div
                  key={task.id}
                  className={`group flex items-start gap-4 rounded-xl border-2 px-5 py-4 transition-all ${
                    task.completed
                      ? "border-stone-100 bg-stone-50/50 opacity-60"
                      : task.importance === "高"
                        ? "border-amber-200 bg-amber-50/30 shadow-md"
                        : task.importance === "中"
                          ? "border-stone-300 bg-white shadow-sm"
                          : "border-stone-200 bg-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleComplete(task)}
                    className="mt-0.5 shrink-0 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    {task.completed ? (
                      <CircleCheck size={22} className="text-green-500" />
                    ) : (
                      <Circle size={22} />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-base font-medium leading-relaxed ${
                        task.completed ? "text-stone-400 line-through" : "text-stone-800"
                      }`}
                    >
                      {task.content}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`badge text-2xs ${TYPE_BADGE[task.type]}`}>{task.type}</span>
                      <span className="inline-flex items-center gap-0.5 text-2xs text-stone-400">
                        <span className={`inline-block h-1.5 w-1.5 rounded-full ${IMPORTANCE_DOT[task.importance]}`} />
                        {task.importance}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleTodayFocus(task)}
                    className={`shrink-0 transition-all ${
                      task.isTodayFocus
                        ? "text-amber-400 hover:text-amber-500"
                        : "text-stone-300 hover:text-stone-500 opacity-0 group-hover:opacity-100"
                    }`}
                    title={task.isTodayFocus ? "移出今日焦点" : "加入今日焦点"}
                  >
                    <Star size={18} fill={task.isTodayFocus ? "currentColor" : "none"} />
                  </button>
                  <button
                    type="button"
                    onClick={() => { remove(task.id); toast.show("任务已删除"); }}
                    className="shrink-0 text-stone-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    title="删除任务"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ) : (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={() => toggleComplete(task)}
                  onToggleFocus={() => toggleTodayFocus(task)}
                  onDelete={() => { remove(task.id); toast.show("任务已删除"); }}
                />
              )
            )}
          </div>
        )}

        {/* Quick add */}
        {quickAddOpen ? (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={quickContent}
                onChange={(e) => setQuickContent(e.target.value)}
                placeholder="快速添加一条任务..."
                className="flex-1 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:border-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-300"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleQuickAdd();
                  if (e.key === "Escape") { setQuickAddOpen(false); setQuickContent(""); }
                }}
              />
              <button type="button" onClick={handleQuickAdd} disabled={!quickContent.trim()} className="rounded-lg bg-stone-800 px-3 py-2 text-xs text-white hover:bg-stone-700 disabled:opacity-30">
                添加
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-2xs text-stone-400">类型</span>
                {(["生活杂事", "长期目标", "自我照顾", "灵感收件箱"] as Task["type"][]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setQuickType(t)}
                    className={`rounded-full px-2 py-0.5 text-2xs font-medium transition-all ${
                      quickType === t ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-2xs text-stone-400">重要</span>
                {(["高", "中", "低"] as Task["importance"][]).map((imp) => (
                  <button
                    key={imp}
                    type="button"
                    onClick={() => setQuickImportance(imp)}
                    className={`rounded-full px-2 py-0.5 text-2xs font-medium transition-all ${
                      quickImportance === imp
                        ? imp === "高"
                          ? "bg-amber-100 text-amber-800"
                          : imp === "中"
                            ? "bg-stone-200 text-stone-700"
                            : "bg-stone-100 text-stone-500"
                        : "bg-stone-50 text-stone-400 hover:bg-stone-100"
                    }`}
                  >
                    {imp}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setQuickAddOpen(true)} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-stone-300 py-2.5 text-xs text-stone-400 transition-colors hover:border-stone-400 hover:text-stone-600">
            <Plus size={14} />
            快速添加任务
          </button>
        )}
      </section>

      {/* English Learning */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-stone-600">英语学习</h2>
          <Link to="/ritual" className="text-2xs text-stone-400 hover:text-stone-600">素材库 →</Link>
        </div>
        <div className="space-y-3">
          {/* Daily phrase */}
          {todayEnglish ? (
            <div className="card">
              <p className="text-sm font-medium leading-relaxed text-stone-800">{todayEnglish.content}</p>
              {todayEnglish.translation && <p className="mt-1.5 text-xs text-stone-500">{todayEnglish.translation}</p>}
              <span className="mt-2 inline-block badge bg-stone-100 text-stone-500">{todayEnglish.type}</span>
            </div>
          ) : (
            <div className="card py-5 text-center">
              <p className="text-sm text-stone-400">暂无英语素材，去素材库添加</p>
            </div>
          )}

          {/* Quick vocab add */}
          <div className="card space-y-2">
            <p className="text-2xs font-medium text-stone-500">快速记单词</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                placeholder="单词"
                className="flex-1 rounded-lg border border-stone-200 px-3 py-1.5 text-xs"
              />
              <input
                type="text"
                value={newWordTrans}
                onChange={(e) => setNewWordTrans(e.target.value)}
                placeholder="释义"
                className="flex-1 rounded-lg border border-stone-200 px-3 py-1.5 text-xs"
                onKeyDown={(e) => { if (e.key === "Enter") handleAddWord(); }}
              />
              <button type="button" onClick={handleAddWord} disabled={!newWord.trim() || !newWordTrans.trim()} className="shrink-0 rounded-lg bg-stone-800 px-3 py-1.5 text-xs text-white hover:bg-stone-700 disabled:opacity-30">
                记下
              </button>
            </div>

            {/* Recent words */}
            {recentWords.length > 0 && (
              <div className="border-t border-stone-100 pt-2">
                <p className="text-2xs text-stone-400 mb-1.5">最近单词</p>
                <div className="flex flex-wrap gap-1.5">
                  {recentWords.map((v) => (
                    <span key={v.id} className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-0.5 text-2xs text-stone-600 group">
                      <strong>{v.word}</strong> {v.translation}
                      <button type="button" onClick={() => { removeWord(v.id); toast.show("已移除"); }} className="ml-0.5 text-stone-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Reading Room + Member Hub previews */}
      <div className="space-y-3">
        <Link to="/media" className="card group flex items-center gap-3 transition-shadow hover:shadow-md">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
            <BookOpen size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-stone-700">阅读室</p>
            <p className="text-2xs text-stone-400">书籍 · 影视 · 课程 · 播客</p>
          </div>
          <ChevronRight size={16} className="text-stone-300 group-hover:text-stone-500" />
        </Link>

        {(() => {
          const budget = getMonthlyBudget(members);
          const upcoming = getUpcomingRenewals(members, 30);
          return (
            <Link to="/members" className="card group flex items-center gap-3 transition-shadow hover:shadow-md">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                <CreditCardIcon />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-stone-700">会员资产</p>
                {members.length > 0 ? (
                  <p className="text-2xs text-stone-400">
                    本月预算 &yen;{budget.toFixed(0)}
                    {upcoming.length > 0 && ` · ${upcoming.length} 项即将续费`}
                  </p>
                ) : (
                  <p className="text-2xs text-stone-400">订阅管理 · 预算总览</p>
                )}
              </div>
              <ChevronRight size={16} className="text-stone-300 group-hover:text-stone-500" />
            </Link>
          );
        })()}
      </div>

      {/* Today Review */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-stone-600">今日回顾</h2>
        <div className="card">
          {completedToday.length === 0 ? (
            <p className="text-sm text-stone-400">今天还没有完成任务。慢慢来，不着急。</p>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-stone-500">
                  今日完成 <strong className="text-stone-800">{completedToday.length}</strong> 项任务
                </span>
                {focusCompleted.length > 0 && (
                  <span className="text-stone-400">
                    其中焦点 <strong className="text-stone-600">{focusCompleted.length}</strong> 项
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {completedToday.map((t) => (
                  <span key={t.id} className="badge bg-stone-100 text-stone-500 line-through">
                    {t.content.length > 20 ? t.content.slice(0, 20) + "..." : t.content}
                  </span>
                ))}
              </div>
              <p className="text-2xs text-stone-400">
                {focusCompleted.length === focusTasks.length && focusTasks.length > 0
                  ? "焦点任务全部完成，今天很棒。"
                  : completedToday.length > 0
                    ? "一步一步来，已经在路上了。"
                    : "休息也是生活的一部分。"}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function hashDateToIndex(date: string, length: number): number {
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    hash = (hash * 31 + date.charCodeAt(i)) % length;
  }
  return hash;
}

function CreditCardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}
