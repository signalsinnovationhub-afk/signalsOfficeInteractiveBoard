import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  /** Resolved playable URL (empty string = nothing configured). */
  src: string;
  poster?: string | null;
  /** Pause the video (e.g. when the quiz overlay is open). */
  paused?: boolean;
  /** Fallback text when no video is configured yet. */
  placeholder?: React.ReactNode;
  className?: string;
};

/** How often the watchdog checks playback progress. */
const WATCH_MS = 2000;
/** No progress for this long while it should play: reload the source. */
const STALL_MS = 8000;
/** Reloads without any progress before the whole element is replaced. */
const MAX_RELOADS = 3;
/** Element replacements without any progress before the page is reloaded. */
const MAX_REMOUNTS = 2;
/** Gap between releasing the old decoder and attaching the new one. */
const RELEASE_GAP_MS = 150;
/** Minimum time between two automatic page reloads. */
const PAGE_RELOAD_COOLDOWN_MS = 10 * 60_000;
const PAGE_RELOAD_KEY = "signals-video-page-reload-at";

function safeGet(key: string): number {
  try {
    return Number(window.sessionStorage.getItem(key) ?? 0) || 0;
  } catch {
    return 0;
  }
}

function safeSet(key: string, value: number) {
  try {
    window.sessionStorage.setItem(key, String(value));
  } catch {
    /* storage not available, ignore */
  }
}

/**
 * Endless video loop that is robust on Samsung Tizen signage displays.
 *
 * The native `loop` attribute and seeking back to 0 leave the Tizen hardware
 * video plane black after the first pass. Swapping in a new <video> element
 * at the end did not help either, because React inserts the new element
 * before the old one releases its hardware decoder.
 *
 * So at the end of every pass the SAME element releases its source and loads
 * it again from scratch (no seek, only one decoder in use at any time).
 * A watchdog escalates if playback still does not progress:
 *   1. reload the source (up to MAX_RELOADS times),
 *   2. unmount the element, wait, mount a fresh one (up to MAX_REMOUNTS),
 *   3. reload the whole page (only if the video played before, rate limited).
 */
export function MediaVideoTile({ src, poster, paused = false, placeholder, className }: Props) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [generation, setGeneration] = useState(0);
  const [mounted, setMounted] = useState(true);
  const remounts = useRef(0);
  const everPlayed = useRef(false);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    remounts.current = 0;
  }, [src]);

  const remount = useCallback(() => {
    // Unmount first so the old decoder is released before a new one starts.
    setMounted(false);
    window.setTimeout(() => {
      setGeneration((g) => g + 1);
      setMounted(true);
    }, RELEASE_GAP_MS * 2);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !src || !mounted) return;

    // React sets `muted` only as a property; some TV browsers check the
    // attribute for autoplay, so set both explicitly.
    el.muted = true;
    el.defaultMuted = true;
    el.setAttribute("muted", "");
    el.setAttribute("playsinline", "");
    el.setAttribute("webkit-playsinline", "");

    let disposed = false;
    let lastTime = -1;
    let lastProgressAt = Date.now();
    let reloads = 0;
    let errors = 0;
    let reloadTimer: number | undefined;
    let errorTimer: number | undefined;

    const play = () => {
      if (disposed || pausedRef.current || document.hidden) return;
      if (!el.paused && !el.ended) return;
      try {
        Promise.resolve(el.play()).catch(() => {});
      } catch {
        /* old engines throw synchronously */
      }
    };

    const escalate = () => {
      if (disposed) return;
      if (remounts.current >= MAX_REMOUNTS) {
        const last = safeGet(PAGE_RELOAD_KEY);
        if (everPlayed.current && Date.now() - last > PAGE_RELOAD_COOLDOWN_MS) {
          safeSet(PAGE_RELOAD_KEY, Date.now());
          window.location.reload();
          return;
        }
        // Keep trying with fresh elements, but slowly.
        remounts.current = 0;
      }
      remounts.current += 1;
      disposed = true;
      remount();
    };

    /** Start the same file again on the same element, without seeking. */
    const restart = () => {
      if (disposed) return;
      reloads += 1;
      if (reloads > MAX_RELOADS) {
        escalate();
        return;
      }
      lastTime = -1;
      lastProgressAt = Date.now();
      window.clearTimeout(reloadTimer);
      el.pause();
      el.removeAttribute("src");
      el.load();
      reloadTimer = window.setTimeout(() => {
        if (disposed) return;
        lastProgressAt = Date.now();
        el.src = src;
        el.load();
        play();
      }, RELEASE_GAP_MS);
    };

    const onEnded = () => {
      // A completed pass is success, not a failure: do not count it.
      reloads = 0;
      restart();
    };
    const onProgress = () => {
      const t = el.currentTime;
      if (t === lastTime) return;
      // The first reading after a (re)load is only a baseline; real progress
      // means the playhead moved forward from a previous reading.
      const advanced = lastTime >= 0 && t > lastTime;
      lastTime = t;
      if (!advanced) return;
      lastProgressAt = Date.now();
      reloads = 0;
      errors = 0;
      remounts.current = 0;
      everPlayed.current = true;
    };
    const onError = () => {
      if (disposed || !el.getAttribute("src")) return;
      window.clearTimeout(errorTimer);
      const wait = Math.min(30_000, 2000 * 2 ** Math.min(errors, 4));
      errors += 1;
      errorTimer = window.setTimeout(restart, wait);
    };
    const onVisibility = () => {
      lastProgressAt = Date.now();
      if (!document.hidden) play();
    };

    const watch = () => {
      if (disposed) return;
      if (pausedRef.current || document.hidden) {
        lastProgressAt = Date.now();
        return;
      }
      onProgress();
      // `ended` events get lost on some TVs: detect the end ourselves.
      const nearEnd =
        Number.isFinite(el.duration) && el.duration > 0 && el.currentTime >= el.duration - 0.25;
      if (el.ended || (nearEnd && Date.now() - lastProgressAt > WATCH_MS)) {
        onEnded();
        return;
      }
      play();
      if (Date.now() - lastProgressAt > STALL_MS) restart();
    };

    el.addEventListener("ended", onEnded);
    el.addEventListener("timeupdate", onProgress);
    el.addEventListener("error", onError);
    el.addEventListener("canplay", play);
    el.addEventListener("loadeddata", play);
    document.addEventListener("visibilitychange", onVisibility);
    const interval = window.setInterval(watch, WATCH_MS);
    play();

    return () => {
      disposed = true;
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("timeupdate", onProgress);
      el.removeEventListener("error", onError);
      el.removeEventListener("canplay", play);
      el.removeEventListener("loadeddata", play);
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearInterval(interval);
      window.clearTimeout(reloadTimer);
      window.clearTimeout(errorTimer);
      // Release the decoder and network buffer of this element.
      el.pause();
      el.removeAttribute("src");
      el.load();
    };
  }, [src, generation, mounted, remount]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !mounted) return;
    if (paused) el.pause();
    else Promise.resolve(el.play()).catch(() => {});
  }, [paused, generation, mounted]);

  if (!src) {
    return (
      <div
        className={`w-full h-full bg-signals-gray-light flex items-center justify-center text-signals-gray-mid font-bold ${
          className ?? ""
        }`}
      >
        {placeholder ?? "Kein Video konfiguriert"}
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full bg-signals-black ${className ?? ""}`}>
      {poster && (
        <img src={poster} alt="" className="absolute inset-0 w-full h-full object-cover" />
      )}
      {mounted && (
        <video
          key={`${src}#${generation}`}
          ref={ref}
          src={src}
          poster={poster ?? undefined}
          muted
          playsInline
          autoPlay
          preload="auto"
          disablePictureInPicture
          className="relative w-full h-full object-cover"
        />
      )}
    </div>
  );
}
