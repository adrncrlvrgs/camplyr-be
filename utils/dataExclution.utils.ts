function excludeKeys<T extends object, K extends keyof T>(
  data: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...data };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

export default excludeKeys;
