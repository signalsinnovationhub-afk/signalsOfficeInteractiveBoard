import { useEffect, useRef, useState } from "react";

/**
 * Tracks user inactivity. After `idleTimeoutSec` of no interaction the
 * `onTimeout` callback fires. In the last `countdownSec` seconds the
 * returned `countdown` value counts down from `countdownSec` to 0; before
 * that it is `null`. The timer resets on any pointer / touch / key event
 * on the window, or when `resetKey` changes.
 */
export function useIdleCountdown({
  idleTimeoutSec,
  countdownSec,
  onTimeout,
  resetKey,
  paused = false,
}: {
  idleTimeoutSec: number;
  countdownSec: number;
  onTimeout: () => void;
  resetKey?: unknown;
  paused?: boolean;
}) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const startedAtRef = useRef<number>(Date.now());
  const firedRef = useRef(false);

  useEffect(() => {
    startedAtRef.current = Date.now();
    firedRef.current = false;
    setCountdown(null);
  }, [resetKey]);

  useEffect(() => {
    if (paused) return;
    const reset = () => {
      startedAtRef.current = Date.now();
      firedRef.current = false;
      setCountdown(null);
    };
    const events: (keyof WindowEventMap)[] = [
      "pointerdown",
      "touchstart",
      "keydown",
      "mousemove",
    ];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [paused]);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      const elapsed = (Date.now() - startedAtRef.current) / 1000;
      const remaining = idleTimeoutSec - elapsed;
      if (remaining <= 0) {
        if (!firedRef.current) {
          firedRef.current = true;
          onTimeout();
        }
        return;
      }
      if (remaining <= countdownSec) {
        setCountdown(Math.ceil(remaining));
      } else {
        setCountdown(null);
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [idleTimeoutSec, countdownSec, onTimeout, paused]);

  return countdown;
}
