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
