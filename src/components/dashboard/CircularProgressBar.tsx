import React, { memo } from "react";

interface CircularProgressBarProps {
  style?: {
    percentage?: number | undefined;
    textSize?: number | undefined;
    size?: number | undefined;
    // height?: number | undefined;
    trailColor?: string | undefined;
    pathColor?: string | undefined;
    fontWeight?: number | undefined;
    textColor?: string | undefined;
    textStyle?: string | undefined;
    weight?: number | undefined;
  };
}

const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
  style = {},
}) => {
  const {
    percentage = 50,
    textSize = 16,
    size = 100,
    // height = 120,
    trailColor = "#e6e6e6",
    pathColor = "#3498db",
    fontWeight = 400,
    textColor = "black",
    textStyle = "auto",
    weight = 10,
  } = style;

  const radius: number = (size / 2) - (weight / 2);
  const circumference: number = 2 * Math.PI * radius;
  const strokeDashoffset: number =
    circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size}>
      <circle
        stroke={trailColor}
        strokeWidth={weight}
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        stroke={pathColor}
        strokeWidth={weight}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dy={textSize / 2}
        fontSize={textSize}
        fontWeight={fontWeight}
        // color="red"
        fontStyle={textStyle}
        fill={textColor}
        // style={}
      >
        {`${percentage}%`}
      </text>
    </svg>
  );
};

export default memo(CircularProgressBar);
