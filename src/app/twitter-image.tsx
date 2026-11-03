import OpengraphImage from "./opengraph-image";

// Same card for X/Twitter. Segment config must be literal values.
export const alt = "The GEO Blueprint: a 1.5-hour GEO course by dfrenLearn";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return OpengraphImage();
}
