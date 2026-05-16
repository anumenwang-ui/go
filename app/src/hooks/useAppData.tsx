import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Task, MediaCard, Member, Song, EnglishMaterial, Vocabulary, SpeechRecord, Inspiration, DailyEnergy, EnergyLevel } from "../data/types";
import * as S from "../data/storage";

interface AppDataState {
  tasks: Task[];
  mediaCards: MediaCard[];
  inspirations: Inspiration[];
  members: Member[];
  songs: Song[];
  englishMaterials: EnglishMaterial[];
  vocabularies: Vocabulary[];
  speechRecords: SpeechRecord[];
  dailyEnergies: DailyEnergy[];
  todayEnergy: DailyEnergy | null;
  refresh: () => void;
}

const AppDataContext = createContext<AppDataState | null>(null);

function loadAll() {
  return {
    tasks: S.getTasks(),
    mediaCards: S.getMediaCards(),
    inspirations: S.getInspirations(),
    members: S.getMembers(),
    songs: S.getSongs(),
    englishMaterials: S.getEnglishMaterials(),
    vocabularies: S.getVocabularies(),
    speechRecords: S.getSpeechRecords(),
    dailyEnergies: S.getDailyEnergies(),
    todayEnergy: S.getTodayEnergy(),
  };
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(loadAll);
  const refresh = useCallback(() => setData(loadAll()), []);
  return (
    <AppDataContext.Provider value={{ ...data, refresh }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}

// ─── Convenience action hooks ─────────────────────────

export function useTaskActions() {
  const { refresh } = useAppData();
  return {
    add: (content: string, type: Task["type"], importance: Task["importance"]) => {
      S.createTask({ content, type, importance });
      refresh();
    },
    update: (task: Task) => {
      S.saveTask(task);
      refresh();
    },
    remove: (id: string) => {
      S.deleteTask(id);
      refresh();
    },
    toggleComplete: (task: Task) => {
      const updated: Task = {
        ...task,
        completed: !task.completed,
        completedAt: !task.completed ? new Date().toISOString() : null,
      };
      S.saveTask(updated);
      refresh();
    },
    toggleTodayFocus: (task: Task) => {
      S.saveTask({ ...task, isTodayFocus: !task.isTodayFocus });
      refresh();
    },
  };
}

export function useEnergyActions() {
  const { refresh } = useAppData();
  return {
    setEnergy: (level: EnergyLevel) => {
      S.setTodayEnergy(level);
      refresh();
    },
  };
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ─── Song actions ─────────────────────────────────────

export function useSongActions() {
  const { refresh } = useAppData();
  return {
    add: (partial: Pick<Song, "name" | "artist" | "coverUrl" | "neteaseUrl" | "note">) => {
      S.saveSong({ id: genId(), ...partial });
      refresh();
    },
    update: (song: Song) => {
      S.saveSong(song);
      refresh();
    },
    remove: (id: string) => {
      S.deleteSong(id);
      refresh();
    },
  };
}

// ─── English actions ──────────────────────────────────

export function useEnglishActions() {
  const { refresh } = useAppData();
  return {
    add: (partial: Pick<EnglishMaterial, "content" | "translation" | "type" | "source">) => {
      S.saveEnglishMaterial({ id: genId(), ...partial });
      refresh();
    },
    update: (mat: EnglishMaterial) => {
      S.saveEnglishMaterial(mat);
      refresh();
    },
    remove: (id: string) => {
      S.deleteEnglishMaterial(id);
      refresh();
    },
  };
}

// ─── Vocabulary actions ───────────────────────────────

export function useVocabularyActions() {
  const { refresh } = useAppData();
  return {
    add: (word: string, translation: string) => {
      S.createVocabulary(word, translation);
      refresh();
    },
    update: (v: Vocabulary) => {
      S.saveVocabulary(v);
      refresh();
    },
    remove: (id: string) => {
      S.deleteVocabulary(id);
      refresh();
    },
  };
}

// ─── Media card actions ───────────────────────────────

export function useMediaActions() {
  const { refresh } = useAppData();
  return {
    add: (partial: Pick<MediaCard, "name" | "category" | "coverUrl" | "notes"> & Partial<Pick<MediaCard, "author" | "totalPages">>) => {
      const card: MediaCard = {
        id: genId(),
        name: partial.name,
        category: partial.category,
        coverUrl: partial.coverUrl || "",
        notes: partial.notes || "",
        progress: "",
        status: "进行中",
        updatedAt: new Date().toISOString(),
        author: partial.author,
        totalPages: partial.totalPages,
        currentPage: 0,
      };
      S.saveMediaCard(card);
      refresh();
    },
    update: (card: MediaCard) => {
      S.saveMediaCard(card);
      refresh();
    },
    remove: (id: string) => {
      S.deleteMediaCard(id);
      refresh();
    },
  };
}

// ─── Member actions ───────────────────────────────────

export function useMemberActions() {
  const { refresh } = useAppData();
  return {
    add: (partial: Pick<Member, "name" | "amount" | "billingCycle" | "nextBillingDate" | "category" | "notes">) => {
      S.saveMember({ id: genId(), enabled: true, ...partial });
      refresh();
    },
    update: (member: Member) => {
      S.saveMember(member);
      refresh();
    },
    remove: (id: string) => {
      S.deleteMember(id);
      refresh();
    },
    toggleEnabled: (member: Member) => {
      S.saveMember({ ...member, enabled: !member.enabled });
      refresh();
    },
  };
}

// ─── Inspiration actions ──────────────────────────────

export function useInspirationActions() {
  const { refresh } = useAppData();
  return {
    add: (mediaId: string, content: string, page?: number) => {
      S.createInspiration(mediaId, content, page);
      refresh();
    },
    update: (insp: Inspiration) => {
      S.saveInspiration(insp);
      refresh();
    },
    remove: (id: string) => {
      S.deleteInspiration(id);
      refresh();
    },
  };
}

// ─── Speech actions ───────────────────────────────────

export function useSpeechActions() {
  const { refresh } = useAppData();
  return {
    add: (topicId: string, duration: number) => {
      S.createSpeechRecord(topicId, duration);
      refresh();
    },
    remove: (id: string) => {
      S.deleteSpeechRecord(id);
      refresh();
    },
  };
}
