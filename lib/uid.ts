export function uid(prefix = ""): string {
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  return prefix ? `${prefix}-${id}` : id;
}
