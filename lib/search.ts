export function matchesQuery(query: string, fields: string[]): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const words = q.split(/\s+/);
  const hay = fields.join(" ").toLowerCase();
  return words.every((word) => hay.includes(word));
}
