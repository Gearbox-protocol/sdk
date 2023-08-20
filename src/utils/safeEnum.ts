export function safeEnum(t: string): string {
  if (!isNaN(parseInt(t.charAt(0), 10))) {
    return `_${t}`;
  }
  return t;
}
