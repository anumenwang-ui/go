import { useState, useMemo } from "react";
import { useAppData } from "../hooks/useAppData";
import { computeReview, getWeekRange, getMonthRange, getSummarySentence } from "../data/review";
import type { Task } from "../data/types";
import { Calendar } from "lucide-react";

type RangeMode = "本周" | "本月" | "自定义";

export function Review() {
  const { tasks, mediaCards, inspirations, members } = useAppData();
  const [mode, setMode] = useState<RangeMode>("本周");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const range = useMemo(() => {
    switch (mode) {
      case "本周":
        return getWeekRange();
      case "本月":
        return getMonthRange();
      case "自定义":
        return { start: customStart, end: customEnd };
    }
  }, [mode, customStart, customEnd]);

  const stats = useMemo(
    () => (range.start && range.end ? computeReview(tasks, mediaCards, inspirations, members, range.start, range.end) : null),
    [tasks, mediaCards, inspirations, members, range]
  );

  return (
    <div className="page-shell space-y-6">
      <header>
        <h1 className="text-xl font-medium text-stone-800">回顾</h1>
        <p className="text-xs text-stone-400">看见生活推进的痕迹</p>
      </header>

      {/* Range selector */}
      <div className="flex items-center gap-2">
        {(["本周", "本月", "自定义"] as RangeMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
              mode === m ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-500 hover:bg-stone-200"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {mode === "自定义" && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs"
          />
          <span className="text-xs text-stone-400">至</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs"
          />
        </div>
      )}

      {!stats ? (
        <div className="card py-12 text-center">
          <Calendar size={36} className="mx-auto mb-3 text-stone-300" />
          <p className="text-sm text-stone-400">
            {mode === "自定义" ? "请选择日期区间" : "暂无数据"}
          </p>
        </div>
      ) : (
        <>
          {/* Summary sentence */}
          <div className="card border-amber-100 bg-amber-50/30">
            <p className="text-sm leading-relaxed text-stone-700">{getSummarySentence(stats)}</p>
          </div>

          {/* Metric cards */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard label="完成任务" value={stats.completedTasks} unit="项" />
            <MetricCard label="焦点完成率" value={Math.round(stats.focusRate * 100)} unit="%" />
            <MetricCard label="阅读室储存空间" value={stats.mediaPushed} unit="个" />
            <MetricCard label="内容完结" value={stats.mediaCompleted} unit="个" />
            <MetricCard label="灵感记录" value={stats.inspirationsCount} unit="条" />
            <MetricCard label="区间预算" value={`¥${stats.budget}`} unit="" />
          </div>

          {/* Type distribution */}
          <section>
            <h2 className="mb-3 text-sm font-medium text-stone-600">任务类型分布</h2>
            <div className="card space-y-2">
              {stats.completedTasks === 0 ? (
                <p className="text-sm text-stone-400">暂无完成数据</p>
              ) : (
                (Object.keys(stats.typeDistribution) as Task["type"][]).map((type) => {
                  const count = stats.typeDistribution[type];
                  const pct = stats.completedTasks > 0 ? (count / stats.completedTasks) * 100 : 0;
                  return (
                    <div key={type} className="flex items-center gap-3">
                      <span className="w-16 shrink-0 text-2xs text-stone-500">{type}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-100">
                        <div
                          className="h-full rounded-full bg-stone-400 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-2xs text-stone-500">{count}</span>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Upcoming renewals */}
          {stats.upcomingRenewals > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-medium text-stone-600">区间内即将续费</h2>
              <div className="card">
                <p className="text-sm text-stone-500">{stats.upcomingRenewals} 项订阅在区间内续费</p>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value, unit }: { label: string; value: string | number; unit: string }) {
  return (
    <div className="card text-center">
      <p className="text-2xs text-stone-400">{label}</p>
      <p className="mt-1 text-2xl font-medium text-stone-800">
        {value}
        {unit && <span className="ml-0.5 text-sm font-normal text-stone-400">{unit}</span>}
      </p>
    </div>
  );
}
