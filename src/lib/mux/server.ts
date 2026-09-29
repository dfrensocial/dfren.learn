import Mux from "@mux/mux-node";

let client: Mux | undefined;
function getMux(): Mux {
  client ??= new Mux({
    tokenId: process.env.MUX_TOKEN_ID,
    tokenSecret: process.env.MUX_TOKEN_SECRET,
  });
  return client;
}

// Constructed on first use so a deploy without MUX_* env vars still builds.
export const mux: Mux = new Proxy({} as Mux, {
  get(_, prop) {
    const instance = getMux();
    const value = Reflect.get(instance, prop, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export const muxVideo: Mux["video"] = new Proxy({} as Mux["video"], {
  get(_, prop) {
    const video = getMux().video;
    const value = Reflect.get(video, prop, video);
    return typeof value === "function" ? value.bind(video) : value;
  },
});
