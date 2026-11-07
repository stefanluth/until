export function createHeaders(values: Record<string, string>): { get(name: string): string | null } {
  const normalized = Object.fromEntries(Object.entries(values).map(([name, value]) => [name.toLowerCase(), value]));

  return {
    get(name: string): string | null {
      return normalized[name.toLowerCase()] ?? null;
    },
  };
}
