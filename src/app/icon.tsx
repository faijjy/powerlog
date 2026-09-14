import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
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
          background: "#1e3a5f",
          color: "#e8a317",
          fontSize: 180,
          fontWeight: 700,
          fontFamily: "sans-serif",
        }}
      >
        PL
      </div>
    ),
    { ...size }
  );
}
