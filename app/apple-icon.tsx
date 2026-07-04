import { ImageResponse } from "next/og";

export const runtime = "edge";
export const contentType = "image/png";
export const size = {
  width: 180,
  height: 180,
};

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #fff7fb 0%, #edc2d7 42%, #7f305d 100%)",
          borderRadius: 42,
          color: "#2a1020",
          fontSize: 84,
          fontWeight: 900,
          letterSpacing: "-0.08em",
        }}
      >
        S
      </div>
    ),
    size
  );
}