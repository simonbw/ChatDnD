export function last<T>(array: T[]): T;
export function last(array: string): string;
export function last<T>(array: T[] | string): T | string {
  return array[array.length - 1];
}

export function omit<T extends object, K extends keyof T>(
  obj: T,
  ...keys: K[]
): Omit<T, K> {
  const result = { ...obj } as Omit<T, K>;
  keys.forEach((key) => {
    delete (result as any)[key];
  });
  return result;
}

export function pick<T extends object, K extends keyof T>(
  obj: T,
  ...keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    (result as any)[key] = obj[key];
  });
  return result;
}
