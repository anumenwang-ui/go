import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  CheckSquare,
  Sparkles,
  BookOpen,
  CreditCard,
  BarChart3,
  Download,
  Upload,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { exportAllData, importAllData } from "../data/storage";
import { downloadBackup, readBackupFile } from "../data/backup";
import { useToast } from "../hooks/useToast";

const NAV_ITEMS = [
  { to: "/", label: "首页", icon: LayoutDashboard },
  { to: "/tasks", label: "任务", icon: CheckSquare },
  { to: "/ritual", label: "语言库", icon: Sparkles },
  { to: "/media", label: "阅读室", icon: BookOpen },
  { to: "/members", label: "会员", icon: CreditCard },
  { to: "/review", label: "回顾", icon: BarChart3 },
];

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const toast = useToast();
  const [backupOpen, setBackupOpen] = useState(false);

  const handleExport = () => {
    downloadBackup(exportAllData());
    toast.show("数据已导出");
    setBackupOpen(false);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const data = await readBackupFile(file);
        importAllData(data);
        toast.show("数据已恢复，刷新页面生效");
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        toast.show(err instanceof Error ? err.message : "导入失败");
      }
    };
    input.click();
    setBackupOpen(false);
  };

  return (
    <div className="flex h-svh w-full flex-col overflow-hidden md:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden w-48 shrink-0 flex-col border-r border-stone-200/60 bg-white md:flex">
        <div className="flex h-14 items-center gap-2.5 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100">
            <svg
              viewBox="0 0 100 100"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
            >
              <circle cx="50" cy="42" r="18" />
              <path d="M28 80 Q50 58 72 80" />
            </svg>
          </div>
          <span className="text-sm font-medium text-stone-700">GO</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? currentPath === "/" : currentPath.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-stone-100 text-stone-900 font-medium"
                    : "text-stone-500 hover:bg-stone-50 hover:text-stone-700"
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2 : 1.5} />
                {label}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom: backup */}
        <div className="border-t border-stone-100 px-3 py-2">
          <button
            type="button"
            onClick={() => setBackupOpen(!backupOpen)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-stone-400 hover:bg-stone-50 hover:text-stone-600 transition-colors"
          >
            <SlidersHorizontal size={18} strokeWidth={1.5} />
            备份
          </button>
          {backupOpen && (
            <div className="mt-1 space-y-1 px-3 pb-2">
              <button
                type="button"
                onClick={handleExport}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-2xs text-stone-500 hover:bg-stone-100"
              >
                <Download size={12} />导出备份
              </button>
              <button
                type="button"
                onClick={handleImport}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-2xs text-stone-500 hover:bg-stone-100"
              >
                <Upload size={12} />导入恢复
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-stone-200/60 bg-white/90 backdrop-blur-md md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? currentPath === "/" : currentPath.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 py-1.5 transition-colors ${
                active ? "text-stone-900" : "text-stone-400"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2 : 1.5} />
              <span className="text-2xs">{label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Mobile backup button */}
      <div className="md:hidden fixed top-3 right-3 z-50">
        <button
          type="button"
          onClick={() => setBackupOpen(!backupOpen)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm border border-stone-200/60 text-stone-400 shadow-sm"
        >
          {backupOpen ? <X size={14} /> : <SlidersHorizontal size={14} />}
        </button>
        {backupOpen && (
          <div className="absolute right-0 top-10 w-36 rounded-xl border border-stone-200 bg-white p-2 shadow-lg">
            <button
              type="button"
              onClick={handleExport}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs text-stone-600 hover:bg-stone-50"
            >
              <Download size={14} />导出备份
            </button>
            <button
              type="button"
              onClick={handleImport}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs text-stone-600 hover:bg-stone-50"
            >
              <Upload size={14} />导入恢复
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
