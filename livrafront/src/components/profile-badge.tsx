interface ProfileBadgeProps extends React.SVGProps<SVGSVGElement> {
  content: string | number;
  height?: number;
  backgroundColor?: string;
  textColor?: string;
}

export default function ProfileBadge({
  content,
  height = 30,
  backgroundColor = "white",
  textColor = "black",
  ...props
}: ProfileBadgeProps) {
  const contentLength = String(content).length;
  const baseWidth = height * 1.5;
  const charWidth = height * 0.3;
  const width = Math.max(baseWidth, charWidth * contentLength + height * 0.8);
  
  const radius = height * 0.3;
  //const tailWidth = width * 0.2;
  const tailHeight = height * 0.3;
  const tailStart = width * 0.2;
  const tailEnd = width * 0.4;

  return (
    <svg
      width={width}
      height={height + tailHeight}
      viewBox={`-1 -1 ${width + 2} ${height + tailHeight + 1}`}
      {...props}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={`
          M ${radius} 0
          L ${width - radius} 0
          Q ${width} 0 ${width} ${radius}
          L ${width} ${height - radius}
          Q ${width} ${height} ${width - radius} ${height}
          L ${tailEnd} ${height}
          L ${tailStart} ${height + tailHeight}
          L ${tailStart} ${height}
          L ${radius} ${height}
          Q 0 ${height} 0 ${height - radius}
          L 0 ${radius}
          Q 0 0 ${radius} 0
          Z
        `}
        fill={backgroundColor}
        stroke="black"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Texto/número */}
      <text
        x={width / 2}
        y={height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={textColor}
        fontSize={height * 0.5}
        fontWeight="bold"
        fontFamily="Poppins, sans-serif"
      >
        {content}
      </text>
    </svg>
  );
}