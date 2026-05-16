import type { EnergyLevel } from "../data/types";
import { getEnergyDescription } from "../data/focus";
import { BatteryLow, BatteryMedium, BatteryFull } from "lucide-react";

const LEVELS: { level: EnergyLevel; icon: typeof BatteryLow; label: string }[] = [
  { level: "低", icon: BatteryLow, label: "低" },
  { level: "正常", icon: BatteryMedium, label: "正常" },
  { level: "高", icon: BatteryFull, label: "高" },
];

export function EnergySelector({
  current,
  onChange,
}: {
  current: EnergyLevel | null;
  onChange: (level: EnergyLevel) => void;
}) {
  const active = current ?? "正常";

  return (
    <div>
      <div className="flex items-center gap-1.5">
        {LEVELS.map(({ level, icon: Icon, label }) => (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              active === level
                ? "bg-stone-800 text-white shadow-sm"
                : "bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-700"
            }`}
          >
            <Icon size={13} strokeWidth={2} />
            {label}
          </button>
        ))}
      </div>
      <p className="mt-1.5 text-2xs text-stone-400">{getEnergyDescription(active)}</p>
    </div>
  );
}
