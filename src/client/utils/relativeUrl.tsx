export function relativeUrl(
  add: string,
  base: string = window.location.pathname
) {
  if (base.endsWith("/")) {
    return base + add;
  } else {
    return base + "/" + add;
  }
}
