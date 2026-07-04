import { ImageResponse } from "next/og";

export const runtime = "edge";
export const contentType = "image/png";
export const size = {
  width: 512,
  height: 512,
};

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
          background: "linear-gradient(135deg, #fff7fb 0%, #f1c9dc 45%, #7f305d 100%)",
          borderRadius: 96,
          color: "#2a1020",
          fontSize: 168,
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