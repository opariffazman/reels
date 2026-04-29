import React from "react";
import { COLORS } from "../colors";

// 9:16 aspect ratio phone mockup with gradient wallpaper
// Fits within the video canvas while maintaining proportion

interface PhoneMockupProps {
  children: React.ReactNode;
  height?: number;
  /** Whether to show gradient wallpaper or plain dark bg */
  wallpaper?: boolean;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  children,
  height = 560,
  wallpaper = false,
}) => {
  const width = Math.round(height * (9 / 16));

  return (
    <div
      style={{
        width,
        height,
        borderRadius: 28,
        position: "relative",
        overflow: "hidden",
        border: `1px solid ${COLORS.border}`,
        // Gradient wallpaper or dark bg
        background: wallpaper
          ? "linear-gradient(145deg, #2d1b4e 0%, #1b3a4b 35%, #163020 65%, #1a1a2e 100%)"
          : "#111111",
      }}
    >
      {/* Status bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.6)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          12:00
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {/* Signal, wifi, battery indicators */}
          <div
            style={{
              width: 14,
              height: 10,
              borderRadius: 2,
              border: "1px solid rgba(255,255,255,0.4)",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 1,
                top: 1,
                bottom: 1,
                width: "70%",
                backgroundColor: "rgba(255,255,255,0.5)",
                borderRadius: 1,
              }}
            />
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};
