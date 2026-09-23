// Thin re-export so the PoC/test scripts and the real app (src/app/api/watermark)
// share one implementation. See src/lib/watermark/codec.ts for the actual scheme.
export { encode, decode, CELL_W, CELL_H } from "../../src/lib/watermark/codec";
