export function RdiBar({
  pct,
  overUl,
}: {
  pct: number;
  overUl?: boolean;
}) {
  const width = Math.min(Math.max(pct, 0), 160);
  const tone = overUl
    ? "bg-terracotta-500"
    : pct >= 100
      ? "bg-sage-600"
      : pct >= 50
        ? "bg-sage-400"
        : "bg-cream-300";
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-cream-200">
      <div
        className={`h-full rounded-full ${tone}`}
        style={{ width: `${(width / 160) * 100}%` }}
      />
    </div>
  );
}
