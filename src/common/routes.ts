const r = {
  home: () => "/",
  test: () => "/test",
  read: () => "/read",
  healthcheck: () => "/_healthcheck",
  esbuild: () => "/esbuild",

  rooms: () => "/rooms",
  room: {
    new: () => "/new-room",
    base: (roomId: string) => `/room/${roomId}`,
    view: (roomId: string) => `${r.room.base(roomId)}/`,
    state: (roomId: string) => `${r.room.base(roomId)}/state`,
    stateStream: (roomId: string) => `${r.room.base(roomId)}/state-stream`,
    join: (roomId: string) => `${r.room.base(roomId)}/join`,
    message: (roomId: string) => `${r.room.base(roomId)}/message`,
  },
};

export const routes = r;
