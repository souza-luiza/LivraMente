interface ProfileIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  percentage?: number; // 0 a 100
  showProgress?: boolean;
}

export default function ProfileIcon({
  size = 40,
  percentage = 0,
  showProgress = true,
  ...props
}: ProfileIconProps) {

  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size / 2) - 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${size} ${size}`}
      {...props}
    >
      {showProgress && (
        <>
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            opacity="0.2"
          />
          
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${centerX} ${centerY})`}
            style={{ transition: 'stroke-dashoffset 0.3s ease' }}
          />
        </>
      )}
      
      <circle
        cx={centerX}
        cy={centerY}
        r={showProgress ? radius - 5 : radius}
        fill="currentColor"
      />
    </svg>
  );
}