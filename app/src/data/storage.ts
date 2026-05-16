import type {
  AppData,
  Task,
  MediaCard,
  Inspiration,
  Member,
  Song,
  EnglishMaterial,
  Vocabulary,
  SpeechRecord,
  DailyEnergy,
} from "./types";
import { BUILT_IN_ENGLISH } from "./seed";

const KEYS = {
  tasks: "kb_tasks",
  mediaCards: "kb_media",
  inspirations: "kb_inspirations",
  members: "kb_members",
  songs: "kb_songs",
  englishMaterials: "kb_english",
  vocabularies: "kb_vocab",
  speechRecords: "kb_speech",
  dailyEnergies: "kb_energy",
  dailySongIndex: "kb_song_idx",
  englishIndex: "kb_eng_idx",
  version: "kb_version",
} as const;

const CURRENT_VERSION = 1;

// ─── Generic helpers ──────────────────────────────────

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ─── Initialization & migration ───────────────────────

export function initStorage(): void {
  const version = read<number>(KEYS.version, 0);
  if (version < CURRENT_VERSION) {
    // Seed built-in English materials on first run
    if (read<EnglishMaterial[]>(KEYS.englishMaterials, []).length === 0) {
      write(KEYS.englishMaterials, BUILT_IN_ENGLISH);
    }
    write(KEYS.version, CURRENT_VERSION);
  }
}

// ─── Tasks ────────────────────────────────────────────

export function getTasks(): Task[] {
  return read<Task[]>(KEYS.tasks, []);
}

export function saveTask(task: Task): void {
  const tasks = getTasks();
  const idx = tasks.findIndex((t) => t.id === task.id);
  if (idx >= 0) tasks[idx] = task;
  else tasks.push(task);
  write(KEYS.tasks, tasks);
}

export function deleteTask(id: string): void {
  const tasks = getTasks().filter((t) => t.id !== id);
  write(KEYS.tasks, tasks);
}

export function createTask(partial: Pick<Task, "content" | "type" | "importance">): Task {
  const task: Task = {
    id: generateId(),
    content: partial.content,
    type: partial.type,
    importance: partial.importance,
    createdAt: new Date().toISOString(),
    isTodayFocus: false,
    completed: false,
    completedAt: null,
  };
  saveTask(task);
  return task;
}

// ─── Media Cards ──────────────────────────────────────

export function getMediaCards(): MediaCard[] {
  return read<MediaCard[]>(KEYS.mediaCards, []);
}

export function saveMediaCard(card: MediaCard): void {
  const cards = getMediaCards();
  const idx = cards.findIndex((c) => c.id === card.id);
  if (idx >= 0) cards[idx] = { ...card, updatedAt: new Date().toISOString() };
  else cards.push({ ...card, updatedAt: new Date().toISOString() });
  write(KEYS.mediaCards, cards);
}

export function deleteMediaCard(id: string): void {
  const cards = getMediaCards().filter((c) => c.id !== id);
  write(KEYS.mediaCards, cards);
  // Also remove related inspirations
  const inspirations = getInspirations().filter((i) => i.mediaId !== id);
  write(KEYS.inspirations, inspirations);
}

// ─── Inspirations ─────────────────────────────────────

export function getInspirations(): Inspiration[] {
  return read<Inspiration[]>(KEYS.inspirations, []);
}

export function saveInspiration(inspiration: Inspiration): void {
  const inspirations = getInspirations();
  const idx = inspirations.findIndex((i) => i.id === inspiration.id);
  if (idx >= 0) inspirations[idx] = inspiration;
  else inspirations.push(inspiration);
  write(KEYS.inspirations, inspirations);
}

export function deleteInspiration(id: string): void {
  const inspirations = getInspirations().filter((i) => i.id !== id);
  write(KEYS.inspirations, inspirations);
}

export function createInspiration(mediaId: string, content: string, page?: number): Inspiration {
  const insp: Inspiration = {
    id: generateId(),
    mediaId,
    content,
    date: new Date().toISOString().slice(0, 10),
    page,
  };
  saveInspiration(insp);
  return insp;
}

// ─── Members ──────────────────────────────────────────

export function getMembers(): Member[] {
  return read<Member[]>(KEYS.members, []);
}

export function saveMember(member: Member): void {
  const members = getMembers();
  const idx = members.findIndex((m) => m.id === member.id);
  if (idx >= 0) members[idx] = member;
  else members.push(member);
  write(KEYS.members, members);
}

export function deleteMember(id: string): void {
  const members = getMembers().filter((m) => m.id !== id);
  write(KEYS.members, members);
}

// ─── Songs ────────────────────────────────────────────

export function getSongs(): Song[] {
  return read<Song[]>(KEYS.songs, []);
}

export function saveSong(song: Song): void {
  const songs = getSongs();
  const idx = songs.findIndex((s) => s.id === song.id);
  if (idx >= 0) songs[idx] = song;
  else songs.push(song);
  write(KEYS.songs, songs);
}

export function deleteSong(id: string): void {
  const songs = getSongs().filter((s) => s.id !== id);
  write(KEYS.songs, songs);
}

export function getDailySongIndex(): number {
  return read<number>(KEYS.dailySongIndex, 0);
}

export function advanceDailySongIndex(): number {
  const songs = getSongs();
  if (songs.length === 0) return 0;
  const idx = read<number>(KEYS.dailySongIndex, 0);
  const next = (idx + 1) % songs.length;
  write(KEYS.dailySongIndex, next);
  return next;
}

// ─── English Materials ────────────────────────────────

export function getEnglishMaterials(): EnglishMaterial[] {
  return read<EnglishMaterial[]>(KEYS.englishMaterials, []);
}

export function saveEnglishMaterial(mat: EnglishMaterial): void {
  const materials = getEnglishMaterials();
  const idx = materials.findIndex((m) => m.id === mat.id);
  if (idx >= 0) materials[idx] = mat;
  else materials.push(mat);
  write(KEYS.englishMaterials, materials);
}

export function deleteEnglishMaterial(id: string): void {
  const materials = getEnglishMaterials().filter((m) => m.id !== id);
  write(KEYS.englishMaterials, materials);
}

export function getEnglishIndex(): number {
  return read<number>(KEYS.englishIndex, 0);
}

export function advanceEnglishIndex(): number {
  const materials = getEnglishMaterials();
  if (materials.length === 0) return 0;
  const idx = read<number>(KEYS.englishIndex, 0);
  const next = (idx + 1) % materials.length;
  write(KEYS.englishIndex, next);
  return next;
}

// ─── Vocabulary ───────────────────────────────────────

export function getVocabularies(): Vocabulary[] {
  return read<Vocabulary[]>(KEYS.vocabularies, []);
}

export function saveVocabulary(v: Vocabulary): void {
  const list = getVocabularies();
  const idx = list.findIndex((x) => x.id === v.id);
  if (idx >= 0) list[idx] = v;
  else list.push(v);
  write(KEYS.vocabularies, list);
}

export function deleteVocabulary(id: string): void {
  const list = getVocabularies().filter((v) => v.id !== id);
  write(KEYS.vocabularies, list);
}

export function createVocabulary(word: string, translation: string): Vocabulary {
  const v: Vocabulary = {
    id: generateId(),
    word,
    translation,
    createdAt: new Date().toISOString(),
  };
  saveVocabulary(v);
  return v;
}

// ─── Speech Records ────────────────────────────────────

export function getSpeechRecords(): SpeechRecord[] {
  return read<SpeechRecord[]>(KEYS.speechRecords, []);
}

export function saveSpeechRecord(record: SpeechRecord): void {
  const records = getSpeechRecords();
  const idx = records.findIndex((r) => r.id === record.id);
  if (idx >= 0) records[idx] = record;
  else records.push(record);
  write(KEYS.speechRecords, records);
}

export function deleteSpeechRecord(id: string): void {
  const records = getSpeechRecords().filter((r) => r.id !== id);
  write(KEYS.speechRecords, records);
}

export function createSpeechRecord(topicId: string, duration: number): SpeechRecord {
  const record: SpeechRecord = {
    id: generateId(),
    date: new Date().toISOString().slice(0, 10),
    topicId,
    duration,
  };
  saveSpeechRecord(record);
  return record;
}

// ─── Energy ───────────────────────────────────────────

export function getDailyEnergies(): DailyEnergy[] {
  return read<DailyEnergy[]>(KEYS.dailyEnergies, []);
}

export function getTodayEnergy(): DailyEnergy | null {
  const today = new Date().toISOString().slice(0, 10);
  const energies = getDailyEnergies();
  return energies.find((e) => e.date === today) ?? null;
}

export function setTodayEnergy(level: DailyEnergy["level"]): void {
  const today = new Date().toISOString().slice(0, 10);
  const energies = getDailyEnergies().filter((e) => e.date !== today);
  energies.push({ date: today, level });
  write(KEYS.dailyEnergies, energies);
}

// ─── Bulk export / import ─────────────────────────────

export function exportAllData(): AppData {
  return {
    tasks: getTasks(),
    mediaCards: getMediaCards(),
    inspirations: getInspirations(),
    members: getMembers(),
    songs: getSongs(),
    englishMaterials: getEnglishMaterials(),
    vocabularies: getVocabularies(),
    speechRecords: getSpeechRecords(),
    dailyEnergies: getDailyEnergies(),
    dailySongIndex: getDailySongIndex(),
    englishIndex: getEnglishIndex(),
  };
}

export function importAllData(data: AppData): void {
  write(KEYS.tasks, data.tasks ?? []);
  write(KEYS.mediaCards, data.mediaCards ?? []);
  write(KEYS.inspirations, data.inspirations ?? []);
  write(KEYS.members, data.members ?? []);
  write(KEYS.songs, data.songs ?? []);
  write(KEYS.englishMaterials, data.englishMaterials ?? []);
  write(KEYS.vocabularies, data.vocabularies ?? []);
  write(KEYS.speechRecords, data.speechRecords ?? []);
  write(KEYS.dailyEnergies, data.dailyEnergies ?? []);
  write(KEYS.dailySongIndex, data.dailySongIndex ?? 0);
  write(KEYS.englishIndex, data.englishIndex ?? 0);
}

export function clearAllData(): void {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}
