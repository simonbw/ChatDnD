export function makeSingleton<T>(maker: () => T): () => T {
  let instance: T;

  return () => {
    if (instance === undefined) {
      instance = maker();
    }
    return instance;
  };
}
