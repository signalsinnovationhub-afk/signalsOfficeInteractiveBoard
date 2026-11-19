import { FanShape } from "./FanShape";
import type { Language } from "@/lib/quiz/i18n";

type Props = {
  onSelect: (lang: Language) => void;
};

export function LanguageScreen({ onSelect }: Props) {
  return (
    <div className="relative h-full w-full bg-signals-white flex flex-col items-center justify-center px-8 py-10 gap-12 overflow-hidden">
      <FanShape
        className="absolute -top-16 -right-16 w-[22vw] h-[22vw] opacity-90"
        color="var(--signals-yellow)"
      />
      <FanShape
        className="absolute -bottom-20 -left-20 w-[18vw] h-[18vw] opacity-90"
        color="var(--signals-yellow)"
        rotation={180}
      />

      <div className="text-center relative z-10">
        <h1 className="text-signals-black font-bold text-[clamp(3rem,7.2vw,6rem)] leading-none tracking-tighter">
          Sprache wählen
        </h1>
        <p className="text-signals-gray-mid text-2xl mt-3 font-medium">
          Choose your language
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8 w-full max-w-4xl relative z-10">
        <button
          onClick={() => onSelect("de")}
          className="bg-signals-yellow border-4 border-signals-black p-10 brand-press flex flex-col items-center gap-4"
        >
          <span className="text-7xl" aria-hidden>
            🇩🇪
          </span>
          <span className="text-signals-black text-4xl font-bold tracking-tight">
            Deutsch
          </span>
        </button>
        <button
          onClick={() => onSelect("en")}
          className="bg-signals-gray-light border-4 border-signals-black p-10 brand-press flex flex-col items-center gap-4 hover:bg-signals-yellow transition-colors"
        >
          <span className="text-7xl" aria-hidden>
            🇬🇧
          </span>
          <span className="text-signals-black text-4xl font-bold tracking-tight">
            English
          </span>
        </button>
      </div>
    </div>
  );
}
