import React from "react";

interface MdiIconProps {
  path: string;
  size?: number;
  color?: string;
}

export const MdiIcon: React.FC<MdiIconProps> = ({
  path,
  size = 24,
  color = "currentColor",
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      style={{ display: "block", flexShrink: 0 }}
    >
      <path d={path} fill={color} />
    </svg>
  );
};
