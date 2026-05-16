import type { AppData } from "./types";

const BACKUP_VERSION = 1;

interface BackupFile {
  version: number;
  exportedAt: string; // ISO
  appName: string;
  data: AppData;
}

export function generateBackup(data: AppData): BackupFile {
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    appName: "GO",
    data,
  };
}

export function downloadBackup(data: AppData): void {
  const backup = generateBackup(data);
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const timestamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `GO-backup-${timestamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function readBackupFile(file: File): Promise<AppData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(reader.result as string);
        if (!raw || !raw.data) {
          throw new Error("无效的备份文件格式");
        }
        resolve(raw.data as AppData);
      } catch {
        reject(new Error("无法解析备份文件，请确认文件格式正确"));
      }
    };
    reader.onerror = () => reject(new Error("读取文件失败"));
    reader.readAsText(file);
  });
}
