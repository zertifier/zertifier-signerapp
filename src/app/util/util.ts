export function require<T>(value: T | null | undefined, name: string): T {
  if (value == null) {
    throw new Error(`${name} required but not found.`);
  }
  return value;
}
