export function idMaker() {
  let id = 1;

  return () => {
    return id++;
  };
}
