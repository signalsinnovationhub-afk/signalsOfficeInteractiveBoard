type Props = {
  className?: string;
  color?: string;
  rotation?: number;
};

/** signals brand quarter-circle "Fächer" decor element */
export function FanShape({ className, color = "var(--signals-black)", rotation = 0 }: Props) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={{ transform: `rotate(${rotation}deg)` }}
      aria-hidden
    >
      <path d="M 100 0 L 100 100 L 0 100 A 100 100 0 0 1 100 0 Z" fill={color} />
    </svg>
  );
}
