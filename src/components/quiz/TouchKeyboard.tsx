import { Delete, CornerDownLeft } from "lucide-react";
import { t, type Language } from "@/lib/quiz/i18n";

const rowsDe = [
  ["Q", "W", "E", "R", "T", "Z", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Y", "X", "C", "V", "B", "N", "M"],
];
const rowsEn = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

type Props = {
  language?: Language;
  onKey: (k: string) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
};

export function TouchKeyboard({ language = "de", onKey, onBackspace, onSubmit, canSubmit }: Props) {
  const L = t(language);
  const rows = language === "en" ? rowsEn : rowsDe;
  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-5xl">
      {rows.map((row, ri) => (
        <div key={ri} className="flex gap-3 justify-center">
          {row.map((k) => (
            <button
              key={k}
              onClick={() => onKey(k)}
              className="h-20 w-20 bg-signals-gray-light text-signals-black text-3xl font-bold border-2 border-signals-black active:bg-signals-yellow active:translate-y-1 transition-all"
            >
              {k}
            </button>
          ))}
        </div>
      ))}
      <div className="flex gap-3 mt-2">
        <button
          onClick={onBackspace}
          className="h-20 px-8 bg-signals-gray-light text-signals-black text-2xl font-bold border-2 border-signals-black active:translate-y-1 flex items-center gap-3"
        >
          <Delete className="!size-7" /> {L.deleteKey}
        </button>
        <button
          onClick={() => onKey(" ")}
          aria-label={L.spaceKey}
          className="h-20 px-20 bg-signals-gray-light text-signals-black text-2xl font-bold border-2 border-signals-black active:bg-signals-yellow active:translate-y-1 transition-all"
        >
          {L.spaceKey}
        </button>
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="h-20 px-12 bg-signals-yellow text-signals-black text-2xl font-bold border-2 border-signals-black active:translate-y-1 flex items-center gap-3 disabled:bg-signals-gray-light disabled:text-signals-gray-mid"
        >
          {L.goSubmit} <CornerDownLeft className="!size-7" />
        </button>
      </div>
    </div>
  );
}
