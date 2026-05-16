import { useState } from "react";
import { useAppData, useMemberActions } from "../hooks/useAppData";
import type { Member, BillingCycle, MemberCategory } from "../data/types";
import { getMonthlyBudget, getUpcomingRenewals, getDaysUntilBilling } from "../data/budget";
import { Plus, Trash2, X, Check, CreditCard, AlertCircle } from "lucide-react";

const CYCLES: BillingCycle[] = ["每月", "每年", "自定义"];
const CATEGORIES: MemberCategory[] = ["影音", "工具", "学习", "生活", "其他"];

export function Members() {
  const { members } = useAppData();
  const memberActions = useMemberActions();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);

  const [mName, setMName] = useState("");
  const [mAmount, setMAmount] = useState("");
  const [mCycle, setMCycle] = useState<BillingCycle>("每月");
  const [mDate, setMDate] = useState("");
  const [mCat, setMCat] = useState<MemberCategory>("工具");
  const [mNotes, setMNotes] = useState("");

  const monthlyBudget = getMonthlyBudget(members);
  const upcoming = getUpcomingRenewals(members, 30);

  const sorted = [...members].sort((a, b) => {
    if (a.enabled !== b.enabled) return a.enabled ? -1 : 1;
    return a.nextBillingDate.localeCompare(b.nextBillingDate);
  });

  const openEdit = (member?: Member) => {
    if (member) {
      setEditing(member);
      setMName(member.name);
      setMAmount(String(member.amount));
      setMCycle(member.billingCycle);
      setMDate(member.nextBillingDate);
      setMCat(member.category);
      setMNotes(member.notes);
    } else {
      setEditing(null);
      setMName("");
      setMAmount("");
      setMCycle("每月");
      setMDate(new Date().toISOString().slice(0, 10));
      setMCat("工具");
      setMNotes("");
    }
    setShowForm(true);
  };

  const save = () => {
    if (!mName.trim() || !mAmount || !mDate) return;
    const amount = parseFloat(mAmount);
    if (isNaN(amount) || amount < 0) return;
    const data = {
      name: mName.trim(),
      amount,
      billingCycle: mCycle,
      nextBillingDate: mDate,
      category: mCat,
      notes: mNotes.trim(),
    };
    if (editing) {
      memberActions.update({ ...editing, ...data });
    } else {
      memberActions.add(data);
    }
    setShowForm(false);
  };

  return (
    <div className="page-shell space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-stone-800">会员资产</h1>
          <p className="text-xs text-stone-400">
            {members.filter((m) => m.enabled).length} 个活跃订阅
          </p>
        </div>
        <button
          type="button"
          onClick={() => openEdit()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-stone-800 px-4 py-2 text-xs font-medium text-white hover:bg-stone-700"
        >
          <Plus size={14} />添加订阅
        </button>
      </header>

      {/* Budget overview */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="card">
          <p className="text-2xs font-medium text-stone-400">本月预算</p>
          <p className="mt-1 text-2xl font-medium text-stone-800">
            &yen;{monthlyBudget.toFixed(0)}
          </p>
          <p className="text-2xs text-stone-400">启用订阅的月度总额</p>
        </div>
        <div className="card">
          <p className="text-2xs font-medium text-stone-400">未来 30 天续费</p>
          <p className="mt-1 text-2xl font-medium text-stone-800">
            {upcoming.length} 项
          </p>
          <p className="text-2xs text-stone-400">
            {upcoming.length > 0
              ? `最近：${upcoming[0].name}（${getDaysUntilBilling(upcoming[0].nextBillingDate)} 天后）`
              : "无即将续费项目"}
          </p>
        </div>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="card space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-2xs font-medium text-stone-500">名称 *</label>
              <input
                type="text"
                value={mName}
                onChange={(e) => setMName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-1.5 text-sm"
                placeholder="如：Netflix、Spotify"
                autoFocus
              />
            </div>
            <div>
              <label className="text-2xs font-medium text-stone-500">金额 (CNY) *</label>
              <input
                type="number"
                value={mAmount}
                onChange={(e) => setMAmount(e.target.value)}
                min="0"
                step="0.01"
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-1.5 text-sm"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="text-2xs font-medium text-stone-500">计费周期</label>
              <div className="mt-1 flex gap-1">
                {CYCLES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setMCycle(c)}
                    className={`rounded-full px-2.5 py-0.5 text-2xs ${
                      mCycle === c ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-2xs font-medium text-stone-500">分类</label>
              <div className="mt-1 flex flex-wrap gap-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setMCat(cat)}
                    className={`rounded-full px-2.5 py-0.5 text-2xs ${
                      mCat === cat ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-2xs font-medium text-stone-500">下次续费日期 *</label>
              <input
                type="date"
                value={mDate}
                onChange={(e) => setMDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-1.5 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-2xs font-medium text-stone-500">备注</label>
              <input
                type="text"
                value={mNotes}
                onChange={(e) => setMNotes(e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-1.5 text-sm"
                placeholder="账号、用途等"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={!mName.trim() || !mAmount || !mDate} className="inline-flex items-center gap-1 rounded-lg bg-stone-800 px-3 py-1.5 text-xs text-white hover:bg-stone-700 disabled:opacity-30">
              <Check size={12} />{editing ? "保存" : "添加"}
            </button>
            <button onClick={() => setShowForm(false)} className="rounded-lg px-3 py-1.5 text-xs text-stone-500 hover:text-stone-700">
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Upcoming renewals alert */}
      {upcoming.length > 0 && (
        <div className="rounded-xl border border-amber-200/60 bg-amber-50/60 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={14} className="text-amber-600" />
            <p className="text-xs font-medium text-amber-700">即将续费提醒</p>
          </div>
          <div className="space-y-1.5">
            {upcoming.slice(0, 5).map((m) => {
              const days = getDaysUntilBilling(m.nextBillingDate);
              return (
                <div key={m.id} className="flex items-center justify-between text-xs">
                  <span className="text-stone-700">{m.name}</span>
                  <span className={days <= 3 ? "text-amber-600 font-medium" : "text-stone-400"}>
                    {days === 0 ? "今天" : days === 1 ? "明天" : `${days} 天后`} · &yen;{m.amount}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {sorted.length === 0 && !showForm && (
        <div className="card py-12 text-center">
          <CreditCard size={36} className="mx-auto mb-3 text-stone-300" />
          <p className="text-sm text-stone-400">还没有添加订阅</p>
          <p className="mt-1 text-2xs text-stone-400">记录你的订阅，追踪每月支出</p>
        </div>
      )}

      {/* Subscription list */}
      <div className="space-y-2">
        {sorted.map((member) => {
          const days = getDaysUntilBilling(member.nextBillingDate);
          const urgent = member.enabled && days >= 0 && days <= 3;
          return (
            <div
              key={member.id}
              className={`card flex items-start gap-3 ${
                !member.enabled ? "opacity-50" : urgent ? "ring-1 ring-amber-200" : ""
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                <CreditCard size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-medium ${member.enabled ? "text-stone-800" : "text-stone-400"}`}>
                    {member.name}
                  </p>
                  {!member.enabled && <span className="badge bg-stone-100 text-stone-400">已停用</span>}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-2xs text-stone-400">
                  <span>&yen;{member.amount}</span>
                  <span>·</span>
                  <span>{member.billingCycle}</span>
                  <span>·</span>
                  <span>{member.category}</span>
                  <span>·</span>
                  <span className={urgent ? "text-amber-600 font-medium" : ""}>
                    下次续费 {member.nextBillingDate}
                    {member.enabled && days >= 0 && `（${days === 0 ? "今天" : `${days} 天后`}）`}
                  </span>
                </div>
                {member.notes && <p className="mt-0.5 text-xs text-stone-500">{member.notes}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button onClick={() => memberActions.toggleEnabled(member)} className="text-2xs text-stone-400 hover:text-stone-600">
                  {member.enabled ? "停用" : "启用"}
                </button>
                <button onClick={() => openEdit(member)} className="text-2xs text-stone-400 hover:text-stone-600">
                  编辑
                </button>
                <button onClick={() => memberActions.remove(member.id)} className="text-stone-300 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
