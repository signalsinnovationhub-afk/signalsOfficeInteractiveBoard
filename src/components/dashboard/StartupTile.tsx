import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Sparkles,
  Cpu,
  Leaf,
  ShoppingBag,
  Briefcase,
  Landmark,
  HeartPulse,
  Users,
  Factory,
  Megaphone,
  Car,
  Building2,
  Store,
  Rocket,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { FanShape } from "@/components/quiz/FanShape";
import { Button } from "@/components/ui/button";
import type { Investment } from "@/lib/investments.functions";
import aiFirstImg from "@/assets/categories/AI_first.png.asset.json";
import b2bImg from "@/assets/categories/B2B.jpg.asset.json";
import climateImg from "@/assets/categories/Climate.png.asset.json";
import consumerImg from "@/assets/categories/Consumer.png.asset.json";
import enterpriseImg from "@/assets/categories/Enterprise_Productivity.png.asset.json";
import fintechImg from "@/assets/categories/FinTech.png.asset.json";
import healthImg from "@/assets/categories/Health.png.asset.json";
import hrImg from "@/assets/categories/HR.png.asset.json";
import industryImg from "@/assets/categories/Industry.png.asset.json";
import marketingImg from "@/assets/categories/Marketing.png.asset.json";
import mobilityImg from "@/assets/categories/Mobility.png.asset.json";
import proptechImg from "@/assets/categories/PropTech.png.asset.json";
import retailImg from "@/assets/categories/Retail.png.asset.json";
import spacetechImg from "@/assets/categories/SpaceTech.png.asset.json";

type Props = {
  items?: Investment[];
  paused?: boolean;
};

const CATEGORY_IMAGES: Record<string, string> = {
  "AI first": aiFirstImg.url,
  "B2B/Electronics": b2bImg.url,
  "Climate Tech": climateImg.url,
  Consumer: consumerImg.url,
  "Enterprise/Productivity": enterpriseImg.url,
  FinTech: fintechImg.url,
  HealthTech: healthImg.url,
  "HR Tech": hrImg.url,
  Industry: industryImg.url,
  "Marketing & Sales": marketingImg.url,
  Mobility: mobilityImg.url,
  PropTech: proptechImg.url,
  Retail: retailImg.url,
  SpaceTech: spacetechImg.url,
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "AI first": Sparkles,
  "B2B/Electronics": Cpu,
  "Climate Tech": Leaf,
  Consumer: ShoppingBag,
  "Enterprise/Productivity": Briefcase,
  FinTech: Landmark,
  HealthTech: HeartPulse,
  "HR Tech": Users,
  Industry: Factory,
  "Marketing & Sales": Megaphone,
  Mobility: Car,
  PropTech: Building2,
  Retail: Store,
  SpaceTech: Rocket,
};

const iconFor = (cat: string) => CATEGORY_ICONS[cat] ?? Layers;

const UNCATEGORIZED = "Ohne Kategorie";

function CategoryVisual({
  category,
  count,
  fit = "cover",
  eager = false,
  bg = "bg-signals-black",
  backdrop = false,
}: {
  category: string;
  count: number;
  fit?: "cover" | "contain";
  eager?: boolean;
  bg?: string;
  backdrop?: boolean;
}) {
  const img = CATEGORY_IMAGES[category];
  return (
    <div
      className={`relative w-full h-full text-signals-white overflow-hidden ${bg}`}
      style={{ containerType: "inline-size" } as CSSProperties}
    >
      {img && (
        <>
          {backdrop && fit === "contain" && (
            <img
              src={img}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-25 scale-110 blur-md"
              loading={eager ? "eager" : "lazy"}
            />
          )}
          <img
            src={img}
            alt={`Kategorie ${category}`}
            className={`absolute inset-0 w-full h-full object-center ${fit === "contain" ? "object-contain" : "object-cover"}`}
            loading={eager ? "eager" : "lazy"}
          />
        </>
      )}
      <div className="absolute inset-x-0 top-0 p-[6%] flex">
        <p
          className="bg-signals-yellow text-signals-black font-bold tracking-tight text-[clamp(3.0rem,5.5cqw,6.0rem)] leading-none whitespace-nowrap px-3 py-1.5 font-sans"
          title={category}
        >
          {category}
        </p>
      </div>
    </div>
  );
}

type SizeTier = 1 | 2 | 3;

function getSizeTier(count: number): SizeTier {
  if (count <= 4) return 1;
  if (count <= 12) return 2;
  return 3;
}

// Vier Breitenstufen für die Kategorieübersicht
const WIDTH_TIER: Record<string, number> = {
  "AI first": 27,
  "B2B/Electronics": 27,
  "Enterprise/Productivity": 25,
  HealthTech: 25,
  "Climate Tech": 23,
  Consumer: 23,
  "Marketing & Sales": 23,
};

const widthFor = (name: string) => WIDTH_TIER[name] ?? 21;

// Reihen mit max. 4 Karten, möglichst gleichmäßig gefüllt
function packRows<T>(items: T[], maxPerRow = 4): T[][] {
  const n = items.length;
  if (n === 0) return [];
  const rows = Math.ceil(n / maxPerRow);
  const base = Math.floor(n / rows);
  let rest = n % rows;
  const out: T[][] = [];
  let i = 0;
  for (let r = 0; r < rows; r++) {
    const take = base + (rest > 0 ? 1 : 0);
    if (rest > 0) rest--;
    out.push(items.slice(i, i + take));
    i += take;
  }
  return out;
}



function CategoryPlaceholder({
  category,
  count,
  size = "sm",
  tier = 1,
}: {
  category: string;
  count: number;
  size?: "sm" | "md";
  tier?: SizeTier;
}) {
  const Icon = iconFor(category);
  if (size === "md") {
    return (
      <div
        className="w-full h-full bg-signals-black text-signals-white flex flex-col items-center justify-center gap-[5cqh] px-[6%] py-[6cqh] text-center overflow-hidden"
        style={{ containerType: "size" } as CSSProperties}
      >
        <Icon
          className="shrink-0 text-signals-white"
          style={{ width: "min(26cqh, 20cqw)", height: "min(26cqh, 20cqw)" } as CSSProperties}
        />
        <p
          className="font-bold leading-[1.1] break-words hyphens-auto w-full"
          lang="de"
          style={
            {
              fontSize: "min(15cqh, 9cqw)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            } as CSSProperties
          }
        >
          {category}
        </p>
        <p
          className="text-signals-white font-bold tabular-nums shrink-0 leading-none"
          style={{ fontSize: "min(12cqh, 7cqw)" } as CSSProperties}
        >
          {count} Startups
        </p>
      </div>
    );
  }
  return (
    <div
      data-category={category}
      className="w-full h-full bg-signals-black text-signals-white flex flex-col items-center justify-between overflow-hidden p-[3%] text-center"
      style={{ containerType: "size", gap: "0.5em" } as CSSProperties}
    >
      <Icon
        className="text-signals-white shrink-0"
        style={
          {
             width: "min(30cqh, 50cqw, 4.4rem)",
             height: "min(30cqh, 50cqw, 4.4rem)",
          } as CSSProperties
        }
      />
      <p
        className="font-bold break-words hyphens-auto w-full text-center overflow-hidden leading-[1.1]"
        lang="de"
        style={
          {
            flex: "1 1 0%",
            minHeight: 0,
             fontSize: "min(16cqh, 19cqw, 1.9rem)",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          } as CSSProperties
        }
      >
        {category}
      </p>
      <p
        className="text-signals-white font-bold tabular-nums leading-none shrink-0 text-center w-full whitespace-nowrap overflow-hidden text-ellipsis"
        style={
          {
             fontSize: "min(12cqh, 15cqw, 1.55rem)",
          } as CSSProperties
        }
      >
        {count} Startups
      </p>
    </div>
  );
}

export function StartupTile({ items, paused = false }: Props) {
  const list = items ?? [];

  const categories = useMemo(() => {
    const map = new Map<string, Investment[]>();
    for (const it of list) {
      const key = it.Kategorie?.trim() || UNCATEGORIZED;
      const arr = map.get(key);
      if (arr) arr.push(it);
      else map.set(key, [it]);
    }
    return Array.from(map.entries())
      .map(([name, entries]) => ({ name, entries }))
      .sort((a, b) => a.name.localeCompare(b.name, "de"));
  }, [list]);

  type Page =
    | { type: "visual"; category: string; count: number }
    | { type: "startup"; item: Investment };

  const pages = useMemo<Page[]>(() => {
    const result: Page[] = [];
    for (const c of categories) {
      result.push({ type: "visual", category: c.name, count: c.entries.length });
      for (const item of c.entries) {
        result.push({ type: "startup", item });
      }
    }
    return result;
  }, [categories]);

  const [overview, setOverview] = useState(true);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [slideshow, setSlideshow] = useState(true);
  const [slideIdx, setSlideIdx] = useState(0);
  const [previousSlide, setPreviousSlide] = useState<number | null>(null);
  const lastTouchRef = useRef(Date.now());

  // Keep only the current and outgoing image mounted during the crossfade.
  useEffect(() => {
    if (!slideshow || paused || categories.length < 2) return;
    const id = window.setInterval(() => {
      setPreviousSlide(slideIdx);
      setSlideIdx((slideIdx + 1) % categories.length);
    }, 7000);
    return () => window.clearInterval(id);
  }, [slideshow, paused, categories.length, slideIdx]);

  useEffect(() => {
    if (previousSlide === null) return;
    const id = window.setTimeout(() => setPreviousSlide(null), 750);
    return () => window.clearTimeout(id);
  }, [previousSlide]);

  // Nach 30 s ohne Berührung zurück in die Diashow
  useEffect(() => {
    if (slideshow) return;
    const id = window.setInterval(() => {
      if (Date.now() - lastTouchRef.current > 30000) {
        setOverview(true);
        setIndex(0);
        setVisible(true);
        setSlideshow(true);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [slideshow]);

  const total = pages.length;
  const page = overview ? null : (pages[index] ?? null);
  const item = page?.type === "startup" ? page.item : null;
  const visual = page?.type === "visual" ? page : null;

  const goToPage = (nextIndex: number) => {
    const normalized = (nextIndex + total) % total;
    setVisible(false);
    window.setTimeout(() => {
      setIndex(normalized);
      setOverview(false);
      setVisible(true);
    }, 250);
  };

  const advance = (dir: 1 | -1) => {
    if (total === 0) return;
    if (overview) {
      goToPage(0);
      return;
    }
    goToPage(index + dir);
  };

  const manual = (dir: 1 | -1) => {
    advance(dir);
  };

  const openCategory = (name: string) => {
    const target = pages.findIndex((p) => p.type === "visual" && p.category === name);
    if (target < 0) return;
    goToPage(target);
  };

  const backToOverview = () => {
    setVisible(false);
    window.setTimeout(() => {
      setOverview(true);
      setIndex(0);
      setVisible(true);
    }, 250);
  };

  const handleBack = () => {
    if (item) {
      // Von einem Startup zurück zur Coverpage der Kategorie
      const cat = item.Kategorie?.trim() || UNCATEGORIZED;
      const target = pages.findIndex((p) => p.type === "visual" && p.category === cat);
      if (target >= 0) {
        goToPage(target);
        return;
      }
    }
    backToOverview();
  };


  // Auto-fit: shrink the card's base font size until nothing overflows
  const fitRef = useRef<HTMLDivElement>(null);
  const [base, setBase] = useState(20);

  const fit = () => {
    const box = fitRef.current;
    if (!box) return;
    const max = Math.min(Math.max(window.innerWidth * 0.014, 14), 22);
    let size = max;
    box.style.fontSize = `${size}px`;
    let guard = 0;
    while (
      size > 7 &&
      (box.scrollHeight > box.clientHeight + 1 || box.scrollWidth > box.clientWidth + 1) &&
      guard++ < 80
    ) {
      size -= 0.25;
      box.style.fontSize = `${size}px`;
    }
    setBase(size);
  };

  useLayoutEffect(fit, [item?.Unternehmen, item?.Beschreibung, overview]);

  useEffect(() => {
    const box = fitRef.current;
    if (!box) return;
    const ro = new ResizeObserver(() => fit());
    ro.observe(box);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [item]);

  if (slideshow && categories.length > 0) {
    return (
      <div className="relative w-full h-full bg-signals-gray-light overflow-hidden p-6 flex flex-col">
        <div className="relative z-10 flex items-center gap-3">
          <button
            type="button"
            aria-label="Zur Kategorieübersicht"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              lastTouchRef.current = Date.now();
              setOverview(true);
              setSlideshow(false);
            }}
            className="bg-signals-black text-signals-white p-2 shadow-none"
          >
            <Home className="w-5 h-5" />
          </button>
          <p className="text-signals-gray-mid font-bold text-xs uppercase tracking-widest truncate">{categories[slideIdx]?.entries.length ?? 0} Startups</p>
        </div>
        <div className="relative z-10 flex-1 min-h-0 mt-4">
          {categories.map((c, i) => i === slideIdx || i === previousSlide ? (
            <Button
              key={c.name}
              type="button"
              aria-label={`Kategorie ${c.name} öffnen`}
              aria-hidden={i !== slideIdx}
              tabIndex={i === slideIdx ? 0 : -1}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                lastTouchRef.current = Date.now();
                const target = pages.findIndex((p) => p.type === "visual" && p.category === c.name);
                setIndex(Math.max(0, target));
                setOverview(false);
                setVisible(true);
                setSlideshow(false);
              }}
              variant="ghost"
              className="absolute inset-0 w-full h-full p-0 shadow-none transition-opacity duration-700"
              style={{ opacity: i === slideIdx ? 1 : 0, pointerEvents: i === slideIdx ? "auto" : "none" }}
            >
              <CategoryVisual category={c.name} count={c.entries.length} fit="cover" eager />
            </Button>
          ) : null)}
          <span className="pointer-events-none absolute right-[4%] bottom-[5%] animate-pulse-soft rounded-full border border-signals-white text-signals-white bg-signals-black/25 font-bold text-xs px-3 py-1">
            👆 Startups entdecken
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full bg-signals-gray-light overflow-hidden p-6 flex flex-col"
      onPointerDown={() => {
        lastTouchRef.current = Date.now();
      }}
    >
      <FanShape
        className="pointer-events-none absolute -bottom-24 -right-24 w-[60%] h-[60%] opacity-10 -z-0"
        rotation={180}
      />

      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="min-w-0 flex items-center gap-3">
          {!overview && (
            <button
              type="button"
              aria-label={item ? "Zurück zur Kategorie" : "Zurück zur Übersicht"}
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleBack}
              className="bg-signals-black text-signals-white p-2 shadow-none"
            >
              {item ? <ChevronLeft className="w-5 h-5" /> : <Home className="w-5 h-5" />}
            </button>
          )}
          <p className="text-signals-gray-mid font-bold text-xs uppercase tracking-widest truncate">
            {overview
              ? "Startups · Kategorien"
              : item
                ? `Startups · ${item.Kategorie ?? UNCATEGORIZED}`
                : visual
                  ? `${visual.count} Startups`
                  : "Startups"}
          </p>
        </div>

        {total > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              aria-label="Zurück"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => manual(-1)}
              className="bg-signals-black text-signals-white p-2 shadow-none"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-signals-gray-mid font-bold text-sm tabular-nums">
              {overview ? 0 : index + 1}/{total}
            </span>
            <button
              type="button"
              aria-label="Weiter"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => manual(1)}
              className="bg-signals-black text-signals-white p-2 shadow-none"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {overview ? (
        categories.length === 0 ? (
          <div className="relative z-10 flex-1 flex items-center justify-center">
            <p className="text-signals-gray-mid font-bold text-xl text-center">Keine Startups verfügbar.</p>
          </div>
        ) : (
          <div
            className="relative z-10 flex-1 min-h-0 mt-4 grid gap-[0.8cqh] overflow-hidden"
            style={
              {
                containerType: "size",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gridAutoRows: "minmax(0, 1fr)",
              } as CSSProperties
            }
          >
            {categories.map((c) => (
              <button
                key={c.name}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => openCategory(c.name)}
                className="min-w-0 min-h-0 overflow-hidden shadow-none p-0"
                aria-label={`Kategorie ${c.name} öffnen`}
              >
                <CategoryPlaceholder
                  category={c.name}
                  count={c.entries.length}
                  size="sm"
                  tier={getSizeTier(c.entries.length)}
                />
              </button>
            ))}
          </div>

        )
      ) : (
        <div
          className="relative z-10 flex-1 min-h-0 mt-4 transition-opacity duration-300"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {visual ? (
            <CategoryVisual category={visual.category} count={visual.count} fit="cover" eager />
          ) : item ? (

            <div
              ref={fitRef}
              className="w-full h-full flex flex-col gap-[0.7em] overflow-hidden"
              style={{ fontSize: `${base}px` }}
            >
              <h2 className="shrink-0 text-signals-black font-bold text-[2em] leading-[1.15] tracking-tighter">
                {item.Unternehmen}
              </h2>

              {item.Kurzbeschreibung && (
                <p className="shrink-0 self-start bg-signals-yellow text-signals-black font-bold text-[clamp(0.75rem,1.2vw,1rem)] leading-tight px-3 py-1.5 whitespace-nowrap">
                  {item.Kurzbeschreibung}
                </p>
              )}

              <div className="shrink-0 flex flex-col">
                {item.Beschreibung && (
                  <>
                    <p className="text-signals-gray-mid font-bold text-[0.7em] uppercase tracking-widest">
                      Beschreibung:
                    </p>
                    <p
                      lang="de"
                      className="text-signals-black/85 font-medium text-[0.85em] leading-normal text-justify"
                      style={{ hyphens: "auto", WebkitHyphens: "auto", hyphenateLimitChars: "6 3 3" } as CSSProperties}
                    >
                      {item.Beschreibung}
                    </p>
                  </>
                )}
              </div>

              <div className="shrink-0 flex flex-col gap-[1.1em] mt-[1.2em]">
                <p className="text-signals-black font-bold text-[0.75em]">
                  Investiert in {item.Investiert_in ?? "–"} · Fonds {item.Fonds ?? "–"}
                </p>
                {item.Website_URL ? (
                  <a
                    href={item.Website_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="self-start bg-signals-yellow text-signals-black font-bold text-[0.8em] px-[0.8em] py-[0.5em] text-center brand-press whitespace-nowrap inline-flex items-center justify-center gap-1"
                  >
                    zur Website <span aria-hidden="true">→</span>
                  </a>
                ) : (
                  <span className="self-start bg-signals-yellow text-signals-black/60 font-bold text-[0.8em] px-[0.8em] py-[0.5em] text-center whitespace-nowrap inline-flex items-center justify-center gap-1">
                    noch keine Website
                  </span>
                )}
              </div>

            </div>
          ) : (
            <div className="relative z-10 flex-1 flex items-center justify-center">
              <p className="text-signals-gray-mid font-bold text-xl text-center">Keine Startups verfügbar.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
