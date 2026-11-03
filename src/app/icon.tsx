import { ImageResponse } from "next/og";

// Browser tab icon. A black tile with a white "d", matching the wordmark.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
          color: "#ffffff",
          fontSize: 50,
          fontWeight: 700,
          borderRadius: 12,
        }}
      >
        d
      </div>
    ),
    { ...size },
  );
}
