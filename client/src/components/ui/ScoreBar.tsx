export function scoreColor(score: number): string {
  if (score >= 85) return "bg-pine-600";
  if (score >= 70) return "bg-pine-400";
  if (score >= 50) return "bg-amber-500";
  if (score >= 30) return "bg-ember-500";
  return "bg-danger";
}

export function ScoreBar({
  score,
  label,
  className = "",
}: {
  score: number;
  label?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between text-xs text-muted mb-1">
          <span>{label}</span>
          <span className="font-semibold text-soot">{score}</span>
        </div>
      )}
      <div className="h-2 rounded-full bg-sand overflow-hidden">
        <div
          className={`h-full rounded-full ${scoreColor(score)} transition-all`}
          style={{ width: `${Math.max(2, Math.min(100, score))}%` }}
        />
      </div>
    </div>
  );
}

export function ScoreRing({ score, size = 96, label }: { score: number; size?: number; label?: string }) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const color =
    pct >= 85 ? "#2F6F4F" : pct >= 70 ? "#559473" : pct >= 50 ? "#B7791F" : pct >= 30 ? "#E07A3F" : "#B3402F";
  return (
    <div className="inline-flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#EFE9DE" strokeWidth="10" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
        />
        <text
          x="50%"
          y="50%"
          className="rotate-90"
          style={{ transformOrigin: "center" }}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size / 4}
          fontWeight={700}
          fill="#2B2926"
        >
          {pct}
        </text>
      </svg>
      {label && <span className="text-xs text-muted">{label}</span>}
    </div>
  );
}
