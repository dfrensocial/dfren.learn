import { ImageResponse } from "next/og";

// Social share card (WhatsApp, LinkedIn, X, Slack, Facebook). Rendered once at
// build time. Next also uses it for twitter:image (see twitter-image.tsx).
export const alt = "The GEO Blueprint: a 1.5-hour GEO course by dfrenLearn";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#000000",
          color: "#ffffff",
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>
          dfren<span style={{ color: "#a3a3a3" }}>Learn</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 28, color: "#a3a3a3", letterSpacing: 6, textTransform: "uppercase" }}>
            The GEO Blueprint
          </div>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 700, lineHeight: 1.08, marginTop: 20, letterSpacing: -2 }}>
            Learn how to get found by ChatGPT, Gemini and Claude
          </div>
          <div style={{ display: "flex", fontSize: 32, color: "#d4d4d4", marginTop: 28 }}>
            A 1.5-hour GEO course. 6 pillars, a live audit, 2 ways to charge for the work.
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30, color: "#d4d4d4" }}>
          <span>learn.dfren.in</span>
          <span>₹599 incl. GST, one time</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
