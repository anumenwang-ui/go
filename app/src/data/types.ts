// ─── Task ──────────────────────────────────────────────
export type TaskType = "生活杂事" | "长期目标" | "自我照顾" | "灵感收件箱";
export type Importance = "低" | "中" | "高";

export interface Task {
  id: string;
  content: string;
  type: TaskType;
  importance: Importance;
  createdAt: string; // ISO
  isTodayFocus: boolean;
  completed: boolean;
  completedAt: string | null; // ISO | null
}

// ─── Energy ────────────────────────────────────────────
export type EnergyLevel = "低" | "正常" | "高";

export interface DailyEnergy {
  date: string; // "YYYY-MM-DD"
  level: EnergyLevel;
}

// ─── Media Journey ─────────────────────────────────────
export type MediaCategory = "书籍" | "剧 / 电影" | "课程" | "播客" | "文章" | "其他";
export type MediaStatus = "进行中" | "暂停" | "完成";

export interface MediaCard {
  id: string;
  name: string;
  category: MediaCategory;
  coverUrl: string;
  progress: string; // free-text, e.g. "第 3 章" or "看到第 5 集"
  status: MediaStatus;
  notes: string;
  updatedAt: string; // ISO
  // Book extras
  author?: string;
  totalPages?: number;
  currentPage?: number;
}

export interface Inspiration {
  id: string;
  mediaId: string; // FK -> MediaCard.id
  content: string;
  date: string; // "YYYY-MM-DD"
  page?: number;
}

// ─── Member Hub ────────────────────────────────────────
export type BillingCycle = "每月" | "每年" | "自定义";
export type MemberCategory = "影音" | "工具" | "学习" | "生活" | "其他";

export interface Member {
  id: string;
  name: string;
  amount: number; // CNY
  billingCycle: BillingCycle;
  nextBillingDate: string; // "YYYY-MM-DD"
  category: MemberCategory;
  notes: string;
  enabled: boolean;
}

// ─── Daily Ritual ──────────────────────────────────────
export interface Song {
  id: string;
  name: string;
  artist: string;
  coverUrl: string;
  neteaseUrl: string;
  note: string;
}

export type EnglishType = "短句" | "表达" | "单词组" | "例句";

export interface EnglishMaterial {
  id: string;
  content: string;
  translation?: string;
  type: EnglishType;
  source?: string;
}

// ─── Vocabulary ─────────────────────────────────────────
export interface Vocabulary {
  id: string;
  word: string;
  translation: string;
  example?: string;
  notes?: string;
  createdAt: string; // ISO
}

// ─── Speech Practice ────────────────────────────────────
export interface SpeechTopic {
  id: string;
  topic: string;
  category: string;
}

export interface SpeechRecord {
  id: string;
  date: string; // "YYYY-MM-DD"
  topicId: string;
  duration: number; // seconds
}

// ─── Review ────────────────────────────────────────────
export interface ReviewRange {
  start: string; // "YYYY-MM-DD"
  end: string; // "YYYY-MM-DD"
}

// ─── App Database ──────────────────────────────────────
export interface AppData {
  tasks: Task[];
  mediaCards: MediaCard[];
  inspirations: Inspiration[];
  members: Member[];
  songs: Song[];
  englishMaterials: EnglishMaterial[];
  vocabularies: Vocabulary[];
  speechRecords: SpeechRecord[];
  dailyEnergies: DailyEnergy[];
  dailySongIndex: number;
  englishIndex: number;
}

export const DEFAULT_DATA: AppData = {
  tasks: [],
  mediaCards: [],
  inspirations: [],
  members: [],
  songs: [],
  englishMaterials: [],
  vocabularies: [],
  speechRecords: [],
  dailyEnergies: [],
  dailySongIndex: 0,
  englishIndex: 0,
};
