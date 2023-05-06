const r = {
  home: () => "/",
  test: () => "/test",
  textToSpeech: () => "/text-to-speech",
  healthcheck: () => "/_healthcheck",
  esbuild: () => "/esbuild",

  generate: {
    character: {
      character: () => `/generate/character`,
      name: () => `/generate/character/name`,
      background: () => `/generate/character/background`,
      description: () => `/generate/character/description`,
      portrait: () => `/generate/character/portrait`,
    },
  },

  rooms: () => "/rooms",
  clearAllRooms: () => "/clear-all-rooms",
  room: {
    new: () => "/new-room",
    base: (roomId: string) => `/room/${roomId}`,
    view: (roomId: string) => `${r.room.base(roomId)}/`,
    state: (roomId: string) => `${r.room.base(roomId)}/state`,
    stateStream: (roomId: string) => `${r.room.base(roomId)}/state-stream`,
    join: (roomId: string) => `${r.room.base(roomId)}/join`,
    postMessage: (roomId: string) => `${r.room.base(roomId)}/message`,
    // Debug stuff
    clearMessages: (roomId: string) => `${r.room.base(roomId)}/soft-reset`,
    json: (roomId: string) => `${r.room.base(roomId)}/json`,
    redrawInventory: (roomId: string) =>
      `${r.room.base(roomId)}/redraw-inventory`,
  },
};

export const routes = r;
