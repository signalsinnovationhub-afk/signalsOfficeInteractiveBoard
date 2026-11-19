import { useEffect, useRef, useState } from "react";

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

const WATCH_MS = 5000;
const STALL_LIMIT_MS = 20_000;

/**
 * Plays one pass of the video per <video> element. At the end of each pass
 * (and on errors or long stalls) the element is replaced by a fresh one, so
 * TV browsers never have to seek back to the start of a used decoder.
 */
export function MediaVideoTile({ src, poster, paused = false, placeholder, className }: Props) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [pass, setPass] = useState(0);
  const [playing, setPlaying] = useState(false);
  const errors = useRef(0);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    errors.current = 0;
    setPass(0);
  }, [src]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !src) return;
    let disposed = false;
    let lastTime = -1;
    let lastProgressAt = Date.now();
    let retryTimer: number | undefined;

    const next = () => {
      if (disposed) return;
      disposed = true;
      setPlaying(false);
      setPass((p) => p + 1);
    };
    const play = () => {
      if (disposed || pausedRef.current || !el.paused) return;
      Promise.resolve(el.play()).catch(() => {});
    };
    const onPlaying = () => {
      errors.current = 0;
      setPlaying(true);
    };
    const onError = () => {
      setPlaying(false);
      window.clearTimeout(retryTimer);
      const wait = Math.min(30_000, 3000 * 2 ** Math.min(errors.current, 3));
      errors.current += 1;
      retryTimer = window.setTimeout(next, wait);
    };
    const onVisibility = () => {
      if (!document.hidden) play();
    };
    const watch = () => {
      if (pausedRef.current || document.hidden) {
        lastProgressAt = Date.now();
        return;
      }
      if (el.currentTime !== lastTime) {
        lastTime = el.currentTime;
        lastProgressAt = Date.now();
        return;
      }
      play();
      if (Date.now() - lastProgressAt > STALL_LIMIT_MS) next();
    };

    el.addEventListener("playing", onPlaying);
    el.addEventListener("ended", next);
    el.addEventListener("error", onError);
    el.addEventListener("canplay", play);
    document.addEventListener("visibilitychange", onVisibility);
    const interval = window.setInterval(watch, WATCH_MS);
    play();

    return () => {
      disposed = true;
      el.removeEventListener("playing", onPlaying);
      el.removeEventListener("ended", next);
      el.removeEventListener("error", onError);
      el.removeEventListener("canplay", play);
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearInterval(interval);
      window.clearTimeout(retryTimer);
      // Release the decoder and network buffer of the replaced element.
      el.pause();
      el.removeAttribute("src");
      el.load();
    };
  }, [src, pass]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (paused) el.pause();
    else Promise.resolve(el.play()).catch(() => {});
  }, [paused, pass]);

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
      <video
        key={`${src}#${pass}`}
        ref={ref}
        src={src}
        muted
        playsInline
        autoPlay
        preload="auto"
        className={`relative w-full h-full object-cover transition-opacity duration-300 ${
          playing ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
