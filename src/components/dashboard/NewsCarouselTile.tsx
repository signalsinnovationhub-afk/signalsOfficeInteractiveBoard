import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { getDashboardNews } from "@/lib/news.functions";
import { getSettings } from "@/lib/settings.functions";

type Props = {
  /** Pause autoplay (e.g. when quiz overlay is open). */
  paused?: boolean;
};

const DATE_FMT = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

// Entfernt "[...]" / "[…]" Platzhalter aus dem Anzeigetext (DB bleibt unverändert).
function sanitizeText(input: string): string {
  return input.replace(/\[\s*(?:\.{3}|…)\s*\]/g, "").replace(/[ \t]{2,}/g, " ").trim();
}

// Deterministischer Shuffle (Fisher-Yates) mit Seed, damit die Reihenfolge pro Tag stabil bleibt.
function seededShuffle<T>(arr: T[], seed: string): T[] {
  const result = [...arr];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  let state = h || 1;
  for (let i = result.length - 1; i > 0; i--) {
    state = (state * 16807) % 2147483647;
    const j = state % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function NewsCarouselTile({ paused = false }: Props) {
  const fetchNews = useServerFn(getDashboardNews);
  const fetchSettings = useServerFn(getSettings);
  const queryClient = useQueryClient();

  const { data: items } = useQuery({
    queryKey: ["dashboard_news"],
    queryFn: () => fetchNews(),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const { data: settings } = useQuery({
    queryKey: ["app_settings"],
    queryFn: () => fetchSettings(),
    staleTime: 30_000,
  });

  const rotationMs = Math.max(2, settings?.news_rotation_sec ?? 5) * 1000;
  const dailyRefreshTime = settings?.news_daily_refresh_time ?? "08:05";

  // Täglicher Refresh zur konfigurierten Uhrzeit (Europe/Berlin)
  useEffect(() => {
    const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(dailyRefreshTime);
    if (!m) return;
    const hh = Number(m[1]);
    const mm = Number(m[2]);

    function msUntilNext(): number {
      const now = new Date();
      const berlinNowStr = now.toLocaleString("en-US", { timeZone: "Europe/Berlin" });
      const berlinNow = new Date(berlinNowStr);
      const target = new Date(berlinNow);
      target.setHours(hh, mm, 0, 0);
      if (target.getTime() <= berlinNow.getTime()) {
        target.setDate(target.getDate() + 1);
      }
      return target.getTime() - berlinNow.getTime();
    }

    const t = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ["dashboard_news"] });
      queryClient.invalidateQueries({ queryKey: ["app_settings"] });
    }, msUntilNext());
    return () => clearTimeout(t);
  }, [dailyRefreshTime, queryClient]);

  const [index, setIndex] = useState(0);

  // Täglicher Seed für deterministisches Shuffle (z.B. "2024-06-04")
  const todaySeed = new Date().toISOString().slice(0, 10);
  const list = useMemo(() => seededShuffle(items ?? [], todaySeed), [items, todaySeed]);

  useEffect(() => {
    if (index >= list.length) setIndex(0);
  }, [list.length, index]);

  useEffect(() => {
    if (paused) return;
    if (list.length <= 1) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % list.length);
    }, rotationMs);
    return () => clearInterval(t);
    // index in deps: nach manuellem Wechsel Timer neu starten, statt zu stoppen
  }, [paused, list.length, rotationMs, index]);

  if (list.length === 0) {
    return (
      <div className="w-full h-full bg-signals-gray-light flex items-center justify-center text-signals-gray-mid font-bold">
        Keine News verfügbar
      </div>
    );
  }

  const current = list[Math.min(index, list.length - 1)];

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-signals-black"
    >
      {/* NEWS Wasserzeichen – sehr dezent */}
      <div className="absolute inset-0 flex items-end justify-end pointer-events-none select-none p-6 md:p-10">
        <span
          className="font-black tracking-tighter leading-none"
          style={{ fontSize: "clamp(5rem, 14vw, 12rem)", color: "rgba(250, 240, 92, 0.07)" }}
        >
          NEWS
        </span>
      </div>

      {/* Inhalt */}
      <div className="absolute inset-0">
        <div className="absolute left-5 right-5 top-5 bottom-24 min-h-0 md:left-7 md:right-7 md:top-7 md:bottom-28 lg:left-8 lg:right-8 lg:top-8 lg:bottom-32 flex flex-col">
          <h2
            className="text-white font-bold leading-tight text-lg md:text-xl lg:text-2xl drop-shadow-lg overflow-hidden"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {sanitizeText(current.title)}
          </h2>

          <div className="mt-3 min-h-0 flex-1">
            {current.full_text && current.full_text.trim().length > 0 && (
              <p
                className="text-white/85 text-xs md:text-sm leading-relaxed drop-shadow whitespace-pre-wrap overflow-hidden"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {sanitizeText(current.full_text)}
              </p>
            )}
          </div>
        </div>

        <div className="absolute bottom-5 left-5 right-5 md:bottom-7 md:left-7 md:right-7 lg:bottom-8 lg:left-8 lg:right-8">
          <div className="flex min-h-8 items-center gap-3 flex-nowrap">
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <span className="px-2.5 py-1 rounded-full bg-signals-black/85 border border-white/40 text-white text-[10px] md:text-xs font-semibold uppercase tracking-wide shadow-sm">
                {current.source}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-signals-black/85 border border-white/40 text-white text-[10px] md:text-xs font-semibold tabular-nums shadow-sm">
                {DATE_FMT.format(new Date(current.created_at))}
              </span>
            </div>

            {list.length > 1 ? (
              <PaginationBar
                count={list.length}
                index={index}
                onSelect={setIndex}
              />
            ) : (
              <div className="flex-1" aria-hidden="true" />
            )}

            <a
              href={current.article_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-signals-yellow text-signals-black text-xs font-semibold hover:bg-signals-yellow/90 transition-colors shadow shrink-0"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Originalquelle öffnen
            </a>
          </div>
        </div>

      </div>

    </div>
  );
}

const DOT_SIZE = 10; // px
const DOT_GAP = 8; // px
const MAX_VISIBLE = 5;

function PaginationBar({
  count,
  index,
  onSelect,
}: {
  count: number;
  index: number;
  onSelect: (i: number) => void;
}) {
  // Sliding window: keep the active dot inside [windowStart, windowStart + visible)
  const visible = Math.min(count, MAX_VISIBLE);
  const trackWidth = visible * DOT_SIZE + (visible - 1) * DOT_GAP;

  const [windowStart, setWindowStart] = useState(0);


  useEffect(() => {
    setWindowStart((start) => {
      const clampedMax = Math.max(0, count - visible);
      let s = Math.min(start, clampedMax);
      if (index < s) s = index;
      else if (index >= s + visible) s = index - visible + 1;
      return Math.max(0, Math.min(s, clampedMax));
    });
  }, [index, count, visible]);

  const preventPointerFocusScroll = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const goPrev = () => {
    onSelect(index === 0 ? count - 1 : index - 1);
  };
  const goNext = () => {
    onSelect(index === count - 1 ? 0 : index + 1);
  };

  return (
    <div className="flex flex-1 min-w-0 items-center justify-center gap-2">
      <button
        type="button"
        aria-label="Vorherige News"
        onMouseDown={preventPointerFocusScroll}
        onClick={goPrev}
        className="shrink-0 h-7 w-7 rounded-full bg-signals-yellow border border-signals-black/30 shadow text-signals-black flex items-center justify-center hover:bg-signals-yellow/90 transition-transform active:scale-95"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div
        className="overflow-hidden"
        style={{ width: trackWidth }}
      >
        <div
          className="flex items-center transition-transform duration-300 ease-out"
          style={{
            gap: DOT_GAP,
            transform: `translateX(-${windowStart * (DOT_SIZE + DOT_GAP)}px)`,
          }}
        >
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Zu News ${i + 1}`}
              onMouseDown={preventPointerFocusScroll}
              onClick={() => onSelect(i)}
              style={{ width: DOT_SIZE, height: DOT_SIZE }}
              className={`shrink-0 rounded-full transition-colors cursor-pointer hover:bg-white ${
                i === index ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        aria-label="Nächste News"
        onMouseDown={preventPointerFocusScroll}
        onClick={goNext}
        className="shrink-0 h-7 w-7 rounded-full bg-signals-yellow border border-signals-black/30 shadow text-signals-black flex items-center justify-center hover:bg-signals-yellow/90 transition-transform active:scale-95"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

