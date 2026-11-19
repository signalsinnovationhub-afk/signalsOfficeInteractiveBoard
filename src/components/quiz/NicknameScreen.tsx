import { useState } from "react";
import { TouchKeyboard } from "./TouchKeyboard";
import { t, type Language } from "@/lib/quiz/i18n";

export function NicknameScreen({
  language,
  onSubmit,
}: {
  language: Language;
  onSubmit: (nickname: string) => void;
}) {
  const [value, setValue] = useState("");
  const L = t(language);

  const handleKey = (k: string) => {
    if (value.length < 16) setValue((v) => v + k);
  };
  const handleBackspace = () => setValue((v) => v.slice(0, -1));
  const canSubmit = value.trim().length >= 2;
  const handleSubmit = () => {
    if (canSubmit) onSubmit(value.trim());
  };

  return (
    <div className="h-full w-full bg-signals-white flex flex-col items-center justify-center px-8 py-10 gap-10">
      <div className="text-center">
        <h1 className="text-signals-black font-bold text-[clamp(3rem,7.2vw,6rem)] leading-none tracking-tighter">
          {L.nicknameTitle}
        </h1>
        <p className="text-signals-gray-mid text-2xl mt-3 font-medium">
          {L.nicknameHint}
        </p>
      </div>

      <div className="w-full max-w-3xl">
        <div className="h-32 border-4 border-signals-black bg-signals-white flex items-center justify-center px-8">
          <span className="text-signals-black text-[clamp(2.4rem,6vw,4.8rem)] font-bold tracking-tight">
            {value || <span className="text-signals-gray-mid">|</span>}
          </span>
        </div>
      </div>

      <TouchKeyboard
        language={language}
        onKey={handleKey}
        onBackspace={handleBackspace}
        onSubmit={handleSubmit}
        canSubmit={canSubmit}
      />
    </div>
  );
}
