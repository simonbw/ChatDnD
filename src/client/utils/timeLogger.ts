/** Wrap a function and return a version of it that prints timing information. */
export function timed<F extends (...args: any[]) => Promise<any>>(
  name: string,
  f: F
): F {
  return (async (...args: Parameters<F>) => {
    const start = performance.now();
    const result = await f(...args);
    const end = performance.now();
    const duration = end - start;
    console.log(`[${duration.toFixed(0)} ms] ${name ?? f.name}`);

    return result;
  }) as F;
}
