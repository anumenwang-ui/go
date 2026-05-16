import { useState } from "react";
import type { Task } from "../data/types";
import { useVoiceInput } from "../hooks/useVoiceInput";
import { Mic, MicOff, Plus } from "lucide-react";

const TYPES: Task["type"][] = ["生活杂事", "长期目标", "自我照顾", "灵感收件箱"];
const IMPORTANCE: Task["importance"][] = ["高", "中", "低"];

export function TaskForm({
  onSubmit,
  onClose,
  initialContent = "",
}: {
  onSubmit: (content: string, type: Task["type"], importance: Task["importance"]) => void;
  onClose: () => void;
  initialContent?: string;
}) {
  const [content, setContent] = useState(initialContent);
  const [type, setType] = useState<Task["type"]>("生活杂事");
  const [importance, setImportance] = useState<Task["importance"]>("中");
  const voice = useVoiceInput();

  const effectiveContent = voice.result || content;

  const handleSubmit = () => {
    const trimmed = effectiveContent.trim();
    if (!trimmed) return;
    onSubmit(trimmed, type, importance);
    setContent("");
    voice.clear();
    onClose();
  };

  const confirmVoice = () => {
    if (voice.result) {
      setContent((prev) => (prev ? prev + " " + voice.result : voice.result));
      voice.clear();
    }
  };

  return (
    <div className="space-y-4">
      {/* Input area */}
      <div>
        <label className="text-2xs font-medium text-stone-500">任务内容</label>
        <div className="mt-1 flex items-start gap-2">
          <textarea
            value={effectiveContent}
            onChange={(e) => {
              setContent(e.target.value);
              voice.clear();
            }}
            placeholder="输入任务内容..."
            rows={2}
            className="flex-1 resize-none rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:border-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-300"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          {voice.supported && (
            <button
              type="button"
              onClick={voice.listening ? voice.stop : voice.start}
              className={`shrink-0 rounded-lg border p-2 transition-all ${
                voice.listening
                  ? "border-red-300 bg-red-50 text-red-500 animate-pulse"
                  : "border-stone-200 bg-stone-50 text-stone-500 hover:border-stone-300 hover:text-stone-700"
              }`}
              title="语音输入"
            >
              {voice.listening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}
        </div>

        {voice.error && <p className="mt-1 text-2xs text-red-500">{voice.error}</p>}

        {/* Voice result confirmation */}
        {voice.result && !voice.listening && (
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 text-sm text-amber-800">
            <span className="flex-1 truncate">"{voice.result}"</span>
            <button type="button" onClick={confirmVoice} className="shrink-0 text-2xs text-amber-600 underline">
              采纳
            </button>
            <button type="button" onClick={voice.clear} className="shrink-0 text-2xs text-stone-400">
              丢弃
            </button>
          </div>
        )}
      </div>

      {/* Type + Importance in one row */}
      <div className="flex gap-6">
        <div>
          <label className="text-2xs font-medium text-stone-500">类型</label>
          <div className="mt-1 flex flex-wrap gap-1">
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`rounded-full px-2.5 py-0.5 text-2xs font-medium transition-all ${
                  type === t ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-2xs font-medium text-stone-500">重要程度</label>
          <div className="mt-1 flex gap-1">
            {IMPORTANCE.map((imp) => (
              <button
                key={imp}
                type="button"
                onClick={() => setImportance(imp)}
                className={`rounded-full px-2.5 py-0.5 text-2xs font-medium transition-all ${
                  importance === imp
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

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!effectiveContent.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-stone-800 px-4 py-2 text-xs font-medium text-white transition-all hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Plus size={14} />
          添加任务
        </button>
        <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-xs text-stone-500 hover:text-stone-700">
          取消
        </button>
      </div>
    </div>
  );
}
