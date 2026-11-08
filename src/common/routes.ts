/** URL paths for the site's pages. Use these instead of hardcoding paths. */
const r = {
  home: () => "/",
  test: () => "/test",

  room: {
    view: (roomId: string) => `/room/${roomId}`,
  },
};

export const routes = r;
