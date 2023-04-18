export function last<T>(array: T[]): T;
export function last(array: string): string;
export function last<T>(array: T[] | string): T | string {
  return array[array.length - 1];
}
