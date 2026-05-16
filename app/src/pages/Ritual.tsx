import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useAppData, useEnglishActions, useSpeechActions } from "../hooks/useAppData";
import type { EnglishMaterial, SpeechTopic } from "../data/types";
import { BUILT_IN_TOPICS } from "../data/seed";
import { Plus, Trash2, BookOpen, X, Check, Mic, Play, Square } from "lucide-react";

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function hashDateToIndex(date: string, length: number): number {
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    hash = (hash * 31 + date.charCodeAt(i)) % length;
  }
  return hash;
}

export function Ritual() {
  const { englishMaterials } = useAppData();
  const englishActions = useEnglishActions();

  const [showEngForm, setShowEngForm] = useState(false);
  const [editingEng, setEditingEng] = useState<EnglishMaterial | null>(null);

  // English form state
  const [eContent, setEContent] = useState("");
  const [eTrans, setETrans] = useState("");
  const [eType, setEType] = useState<EnglishMaterial["type"]>("短句");
  const [eSource, setESource] = useState("");

  const { speechRecords } = useAppData();
  const speechActions = useSpeechActions();

  // Speech practice state
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0); // seconds
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const today = getTodayKey();

  const todayTopic: SpeechTopic = useMemo(() => {
    return BUILT_IN_TOPICS[hashDateToIndex(today, BUILT_IN_TOPICS.length)];
  }, [today]);

  const todayRecords = useMemo(
    () => speechRecords.filter((r) => r.date === today),
    [speechRecords, today]
  );

  const pastRecords = useMemo(
    () => [...speechRecords].sort((a, b) => b.date.localeCompare(a.date) || b.duration - a.duration).slice(0, 10),
    [speechRecords]
  );

  const getTopicById = useCallback((id: string) => BUILT_IN_TOPICS.find((t) => t.id === id), []);

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setRecording(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(URL.createObjectURL(blob));
      };

      recorder.start();
      setRecording(true);
      setElapsed(0);
      setAudioUrl(null);

      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev >= 599) {
            // 10 min limit
            stopRecording();
            return 600;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      alert("无法访问麦克风，请检查浏览器权限设置。");
    }
  };

  const handleStop = () => {
    const duration = elapsed;
    stopRecording();
    if (duration >= 5) {
      speechActions.add(todayTopic.id, duration);
    }
  };

  const handleDiscard = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setElapsed(0);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const todayEnglish = useMemo(() => {
    if (englishMaterials.length === 0) return null;
    return englishMaterials[hashDateToIndex(today, englishMaterials.length)];
  }, [englishMaterials, today]);

  const openEngEdit = (mat?: EnglishMaterial) => {
    if (mat) {
      setEditingEng(mat);
      setEContent(mat.content);
      setETrans(mat.translation || "");
      setEType(mat.type);
      setESource(mat.source || "");
    } else {
      setEditingEng(null);
      setEContent("");
      setETrans("");
      setEType("短句");
      setESource("");
    }
    setShowEngForm(true);
  };

  const saveEnglish = () => {
    if (!eContent.trim()) return;
    if (editingEng) {
      englishActions.update({
        ...editingEng,
        content: eContent.trim(),
        translation: eTrans.trim() || undefined,
        type: eType,
        source: eSource.trim() || undefined,
      });
    } else {
      englishActions.add({
        content: eContent.trim(),
        translation: eTrans.trim() || undefined,
        type: eType,
        source: eSource.trim() || undefined,
      });
    }
    setShowEngForm(false);
  };

  return (
    <div className="page-shell space-y-8">
      <header>
        <h1 className="text-xl font-medium text-stone-800">语言库</h1>
        <p className="text-xs text-stone-400">英语短句、表达、例句素材收集</p>
      </header>

      {/* Today's English */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-stone-600">今日英语</h2>
        {todayEnglish ? (
          <div className="card">
            <p className="text-base font-medium leading-relaxed text-stone-800">{todayEnglish.content}</p>
            {todayEnglish.translation && (
              <p className="mt-2 text-sm text-stone-500">{todayEnglish.translation}</p>
            )}
            <div className="mt-3 flex items-center gap-2">
              <span className="badge bg-stone-100 text-stone-600">{todayEnglish.type}</span>
              {todayEnglish.source && <span className="text-2xs text-stone-400">{todayEnglish.source}</span>}
            </div>
          </div>
        ) : (
          <div className="card py-8 text-center">
            <BookOpen size={28} className="mx-auto mb-2 text-stone-300" />
            <p className="text-sm text-stone-400">暂无英语素材</p>
          </div>
        )}
      </section>

      {/* Speech Practice */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-stone-600">
            <Mic size={14} className="inline mr-1.5 -mt-0.5" />
            每日演讲练习
          </h2>
          <span className="text-2xs text-stone-400">10 分钟</span>
        </div>

        <div className="card space-y-4">
          {/* Topic */}
          <div>
            <span className="badge bg-amber-50 text-amber-700 mb-2">{todayTopic.category}</span>
            <p className="text-base font-medium text-stone-800 leading-relaxed">{todayTopic.topic}</p>
          </div>

          {/* Timer + Controls */}
          {!recording && !audioUrl && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={startRecording}
                className="inline-flex items-center gap-2 rounded-full bg-red-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-600 transition-colors shadow-sm"
              >
                <Mic size={16} />
                开始录音
              </button>
              {todayRecords.length > 0 && (
                <p className="text-2xs text-stone-400">
                  今日已完成 {todayRecords.length} 次练习
                </p>
              )}
            </div>
          )}

          {recording && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-mono text-stone-700 tabular-nums">
                  {String(Math.floor(elapsed / 60)).padStart(2, "0")}:{String(elapsed % 60).padStart(2, "0")}
                </span>
                <span className="text-2xs text-stone-400">/ 10:00</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleStop}
                  className="inline-flex items-center gap-1.5 rounded-full bg-stone-800 px-4 py-2 text-xs font-medium text-white hover:bg-stone-700 transition-colors"
                >
                  <Square size={14} fill="currentColor" />
                  结束录音
                </button>
                <button
                  type="button"
                  onClick={stopRecording}
                  className="rounded-full px-3 py-2 text-xs text-stone-400 hover:text-stone-600"
                >
                  取消
                </button>
              </div>
            </div>
          )}

          {audioUrl && !recording && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <Play size={14} />
                <span>录制完成 · {String(Math.floor(elapsed / 60)).padStart(2, "0")}:{String(elapsed % 60).padStart(2, "0")}</span>
              </div>
              <audio controls src={audioUrl} className="w-full h-9" />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="rounded-full bg-stone-100 px-4 py-1.5 text-xs text-stone-500 hover:bg-stone-200 transition-colors"
                >
                  重新录制
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Past records */}
      {pastRecords.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-stone-600">练习记录</h2>
          <div className="space-y-1.5">
            {pastRecords.map((r) => {
              const topic = getTopicById(r.topicId);
              return (
                <div key={r.id} className="flex items-center gap-3 rounded-lg border border-stone-100 px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs text-stone-600">{topic?.topic ?? "已删除的话题"}</p>
                    <p className="text-2xs text-stone-400">
                      {r.date} · {String(Math.floor(r.duration / 60)).padStart(2, "0")}:{String(r.duration % 60).padStart(2, "0")}
                    </p>
                  </div>
                  <button onClick={() => speechActions.remove(r.id)} className="text-stone-300 hover:text-red-400 shrink-0">
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <hr className="border-stone-200" />

      {/* English material management */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-stone-600">英语素材库</h2>
          <button
            type="button"
            onClick={() => openEngEdit()}
            className="inline-flex items-center gap-1 text-2xs text-stone-500 hover:text-stone-700"
          >
            <Plus size={12} />添加
          </button>
        </div>

        {showEngForm && (
          <div className="card mb-3 space-y-3">
            <div>
              <label className="text-2xs font-medium text-stone-500">内容 *</label>
              <textarea
                value={eContent}
                onChange={(e) => setEContent(e.target.value)}
                rows={2}
                className="mt-1 w-full resize-none rounded-lg border border-stone-200 px-3 py-1.5 text-sm"
                autoFocus
              />
            </div>
            <div>
              <label className="text-2xs font-medium text-stone-500">翻译 / 解释</label>
              <input
                type="text"
                value={eTrans}
                onChange={(e) => setETrans(e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-1.5 text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(["短句", "表达", "单词组", "例句"] as EnglishMaterial["type"][]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setEType(t)}
                  className={`rounded-full px-3 py-1 text-2xs font-medium ${
                    eType === t ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-500"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div>
              <label className="text-2xs font-medium text-stone-500">来源（可选）</label>
              <input
                type="text"
                value={eSource}
                onChange={(e) => setESource(e.target.value)}
                placeholder="如：老友记 S01E01"
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-1.5 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={saveEnglish} disabled={!eContent.trim()} className="inline-flex items-center gap-1 rounded-lg bg-stone-800 px-3 py-1.5 text-xs text-white hover:bg-stone-700 disabled:opacity-30">
                <Check size={12} />{editingEng ? "保存" : "添加"}
              </button>
              <button onClick={() => setShowEngForm(false)} className="rounded-lg px-3 py-1.5 text-xs text-stone-500 hover:text-stone-700">
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        {englishMaterials.length === 0 && !showEngForm ? (
          <div className="card py-6 text-center">
            <p className="text-sm text-stone-400">素材库还是空的</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {englishMaterials.map((mat) => (
              <div key={mat.id} className="flex items-start gap-3 rounded-lg border border-stone-100 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-stone-700">{mat.content}</p>
                  {mat.translation && <p className="text-xs text-stone-400">{mat.translation}</p>}
                  <span className="mt-1 inline-block badge bg-stone-50 text-stone-500">{mat.type}</span>
                </div>
                <button onClick={() => openEngEdit(mat)} className="text-2xs text-stone-400 hover:text-stone-600 shrink-0">
                  编辑
                </button>
                <button onClick={() => englishActions.remove(mat.id)} className="text-stone-300 hover:text-red-400 shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
