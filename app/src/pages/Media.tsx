import { useState } from "react";
import { useAppData, useMediaActions, useInspirationActions } from "../hooks/useAppData";
import type { MediaCard, MediaCategory, MediaStatus } from "../data/types";
import { Plus, Trash2, X, Check, BookOpen, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";

const CATEGORIES: MediaCategory[] = ["书籍", "剧 / 电影", "课程", "播客", "文章", "其他"];
const STATUSES: MediaStatus[] = ["进行中", "暂停", "完成"];

const CATEGORY_ICON: Record<MediaCategory, string> = {
  "书籍": "📖",
  "剧 / 电影": "🎬",
  "课程": "📚",
  "播客": "🎧",
  "文章": "📄",
  "其他": "📌",
};

export function Media() {
  const { mediaCards, inspirations } = useAppData();
  const mediaActions = useMediaActions();
  const inspActions = useInspirationActions();

  const [filter, setFilter] = useState<MediaCategory | "全部">("全部");
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState<MediaCard | null>(null);
  const [expandedBook, setExpandedBook] = useState<string | null>(null);

  // Form state
  const [mName, setMName] = useState("");
  const [mCategory, setMCategory] = useState<MediaCategory>("书籍");
  const [mCover, setMCover] = useState("");
  const [mProgress, setMProgress] = useState("");
  const [mStatus, setMStatus] = useState<MediaStatus>("进行中");
  const [mNotes, setMNotes] = useState("");
  const [mAuthor, setMAuthor] = useState("");
  const [mTotalPages, setMTotalPages] = useState("");
  const [mCurrentPage, setMCurrentPage] = useState("");
  const [mInspContent, setMInspContent] = useState("");

  const filtered = mediaCards
    .filter((c) => filter === "全部" || c.category === filter)
    .sort((a, b) => {
      const sOrder = { "进行中": 0, "暂停": 1, "完成": 2 };
      return (sOrder[a.status] ?? 1) - (sOrder[b.status] ?? 1);
    });

  const openEdit = (card?: MediaCard) => {
    if (card) {
      setEditingCard(card);
      setMName(card.name);
      setMCategory(card.category);
      setMCover(card.coverUrl);
      setMProgress(card.progress);
      setMStatus(card.status);
      setMNotes(card.notes);
      setMAuthor(card.author || "");
      setMTotalPages(card.totalPages ? String(card.totalPages) : "");
      setMCurrentPage(card.currentPage ? String(card.currentPage) : "");
    } else {
      setEditingCard(null);
      setMName("");
      setMCategory("书籍");
      setMCover("");
      setMProgress("");
      setMStatus("进行中");
      setMNotes("");
      setMAuthor("");
      setMTotalPages("");
      setMCurrentPage("");
    }
    setShowForm(true);
  };

  const saveMedia = () => {
    if (!mName.trim()) return;
    const totalPages = parseInt(mTotalPages, 10) || undefined;
    const currentPage = parseInt(mCurrentPage, 10) || 0;
    const base = {
      name: mName.trim(),
      category: mCategory,
      coverUrl: mCover.trim(),
      notes: mNotes.trim(),
      status: mStatus,
      progress: mProgress.trim(),
      author: mAuthor.trim() || undefined,
      totalPages,
      currentPage,
    };

    if (editingCard) {
      mediaActions.update({ ...editingCard, ...base });
    } else {
      mediaActions.add(base);
    }
    setShowForm(false);
  };

  const addInspiration = (mediaId: string) => {
    if (!mInspContent.trim()) return;
    inspActions.add(mediaId, mInspContent.trim());
    setMInspContent("");
  };

  const cardInspirations = (mediaId: string) =>
    inspirations.filter((i) => i.mediaId === mediaId).sort((a, b) => b.date.localeCompare(a.date));

  const pagePercentage = (current: number, total: number) =>
    total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="page-shell space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-stone-800">阅读室</h1>
          <p className="text-xs text-stone-400">
            {mediaCards.filter((c) => c.status === "进行中").length} 个进行中 ·{" "}
            {mediaCards.filter((c) => c.status === "完成").length} 个已完成
          </p>
        </div>
        <button
          type="button"
          onClick={() => openEdit()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-stone-800 px-4 py-2 text-xs font-medium text-white hover:bg-stone-700"
        >
          <Plus size={14} />添加内容
        </button>
      </header>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setFilter("全部")}
          className={`rounded-full px-3 py-1 text-2xs font-medium ${
            filter === "全部" ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-500 hover:bg-stone-200"
          }`}
        >
          全部
        </button>
        {CATEGORIES.map((cat) => {
          const count = mediaCards.filter((c) => c.category === cat).length;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`rounded-full px-3 py-1 text-2xs font-medium ${
                filter === cat ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-500 hover:bg-stone-200"
              }`}
            >
              {CATEGORY_ICON[cat]} {cat}
              {count > 0 && <span className="ml-0.5 opacity-60">{count}</span>}
            </button>
          );
        })}
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
                autoFocus
                placeholder="书名 / 剧名 / 课程名..."
              />
            </div>
            <div>
              <label className="text-2xs font-medium text-stone-500">分类</label>
              <div className="mt-1 flex flex-wrap gap-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setMCategory(cat)}
                    className={`rounded-full px-2.5 py-0.5 text-2xs ${
                      mCategory === cat ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {CATEGORY_ICON[cat]} {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-2xs font-medium text-stone-500">状态</label>
              <div className="mt-1 flex gap-1">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setMStatus(s)}
                    className={`rounded-full px-2.5 py-0.5 text-2xs ${
                      mStatus === s ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-2xs font-medium text-stone-500">封面链接</label>
              <input
                type="url"
                value={mCover}
                onChange={(e) => setMCover(e.target.value)}
                placeholder="https://..."
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="text-2xs font-medium text-stone-500">进度</label>
              <input
                type="text"
                value={mProgress}
                onChange={(e) => setMProgress(e.target.value)}
                placeholder="如：第 3 章 / 看到第 5 集"
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-1.5 text-sm"
              />
            </div>
          </div>

          {/* Book-specific fields */}
          {mCategory === "书籍" && (
            <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-3 space-y-3">
              <p className="text-2xs font-medium text-amber-700">书籍专属信息</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="text-2xs text-stone-500">作者</label>
                  <input
                    type="text"
                    value={mAuthor}
                    onChange={(e) => setMAuthor(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-2xs text-stone-500">总页数</label>
                  <input
                    type="number"
                    value={mTotalPages}
                    onChange={(e) => setMTotalPages(e.target.value)}
                    min="0"
                    className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-2xs text-stone-500">当前页数</label>
                  <input
                    type="number"
                    value={mCurrentPage}
                    onChange={(e) => setMCurrentPage(e.target.value)}
                    min="0"
                    className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-1.5 text-sm"
                  />
                </div>
              </div>
              {parseInt(mTotalPages, 10) > 0 && parseInt(mCurrentPage, 10) >= 0 && (
                <div>
                  <div className="flex items-center justify-between text-2xs text-stone-500">
                    <span>阅读进度</span>
                    <span>{pagePercentage(parseInt(mCurrentPage, 10), parseInt(mTotalPages, 10))}%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all"
                      style={{ width: `${pagePercentage(parseInt(mCurrentPage, 10), parseInt(mTotalPages, 10))}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="text-2xs font-medium text-stone-500">备注</label>
            <textarea
              value={mNotes}
              onChange={(e) => setMNotes(e.target.value)}
              rows={2}
              className="mt-1 w-full resize-none rounded-lg border border-stone-200 px-3 py-1.5 text-sm"
            />
          </div>

          <div className="flex gap-2">
            <button onClick={saveMedia} disabled={!mName.trim()} className="inline-flex items-center gap-1 rounded-lg bg-stone-800 px-3 py-1.5 text-xs text-white hover:bg-stone-700 disabled:opacity-30">
              <Check size={12} />{editingCard ? "保存" : "添加"}
            </button>
            <button onClick={() => setShowForm(false)} className="rounded-lg px-3 py-1.5 text-xs text-stone-500 hover:text-stone-700">
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && !showForm && (
        <div className="card py-12 text-center">
          <BookOpen size={36} className="mx-auto mb-3 text-stone-300" />
          <p className="text-sm text-stone-400">
            {filter === "全部" ? "阅读室还是空的" : `没有"${filter}"分类的内容`}
          </p>
          <p className="mt-1 text-2xs text-stone-400">添加你在读的书、在追的剧、在学的课程</p>
        </div>
      )}

      {/* Media cards */}
      <div className="space-y-3">
        {filtered.map((card) => {
          const cardInsps = cardInspirations(card.id);
          const isExpanded = expandedBook === card.id;
          const isBook = card.category === "书籍";

          return (
            <div key={card.id} className="card space-y-3">
              {/* Card header */}
              <div className="flex items-start gap-3">
                {card.coverUrl ? (
                  <img
                    src={card.coverUrl}
                    alt={card.name}
                    className="h-14 w-14 shrink-0 rounded-lg object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-xl">
                    {CATEGORY_ICON[card.category]}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-stone-800">{card.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="badge bg-stone-100 text-stone-500">{card.category}</span>
                    <StatusBadge status={card.status} />
                    {isBook && card.author && <span className="text-2xs text-stone-400">{card.author}</span>}
                  </div>
                  {card.progress && (
                    <p className="mt-1 text-xs text-stone-500">{card.progress}</p>
                  )}
                  {/* Book progress bar */}
                  {isBook && card.totalPages && card.totalPages > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-stone-200">
                        <div
                          className="h-full rounded-full bg-amber-400"
                          style={{ width: `${pagePercentage(card.currentPage ?? 0, card.totalPages)}%` }}
                        />
                      </div>
                      <span className="text-2xs text-stone-400">
                        {pagePercentage(card.currentPage ?? 0, card.totalPages)}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button onClick={() => openEdit(card)} className="text-2xs text-stone-400 hover:text-stone-600">
                    编辑
                  </button>
                  <button onClick={() => mediaActions.remove(card.id)} className="text-stone-300 hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Notes */}
              {card.notes && (
                <p className="text-xs text-stone-500 italic leading-relaxed">{card.notes}</p>
              )}

              {/* Book inspirations section */}
              {isBook && (
                <div className="border-t border-stone-100 pt-3">
                  <button
                    type="button"
                    onClick={() => setExpandedBook(isExpanded ? null : card.id)}
                    className="flex items-center gap-1 text-2xs font-medium text-stone-500 hover:text-stone-700"
                  >
                    <Lightbulb size={12} />
                    灵感记录
                    {cardInsps.length > 0 && <span className="text-amber-500">({cardInsps.length})</span>}
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 space-y-2">
                      {/* Add inspiration */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={mInspContent}
                          onChange={(e) => setMInspContent(e.target.value)}
                          placeholder="记录灵感..."
                          className="flex-1 rounded-lg border border-stone-200 px-3 py-1.5 text-xs"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") addInspiration(card.id);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => addInspiration(card.id)}
                          disabled={!mInspContent.trim()}
                          className="rounded-lg bg-stone-100 px-3 py-1.5 text-2xs text-stone-600 hover:bg-stone-200 disabled:opacity-30"
                        >
                          记录
                        </button>
                      </div>

                      {/* Existing inspirations */}
                      {cardInsps.length === 0 ? (
                        <p className="text-2xs text-stone-400">还没有灵感记录，读到有感触的地方随时记下来。</p>
                      ) : (
                        cardInsps.map((insp) => (
                          <div key={insp.id} className="flex items-start gap-2 rounded-lg bg-amber-50/50 px-3 py-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-stone-700">{insp.content}</p>
                              <p className="mt-0.5 text-2xs text-stone-400">
                                {insp.date}
                                {insp.page ? ` · 第 ${insp.page} 页` : ""}
                              </p>
                            </div>
                            <button
                              onClick={() => inspActions.remove(insp.id)}
                              className="shrink-0 text-stone-300 hover:text-red-400"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: MediaStatus }) {
  const colors: Record<MediaStatus, string> = {
    "进行中": "bg-green-50 text-green-700",
    "暂停": "bg-stone-100 text-stone-500",
    "完成": "bg-stone-200 text-stone-600",
  };
  return <span className={`badge ${colors[status]}`}>{status}</span>;
}
