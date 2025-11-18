import Image from "next/image";

interface ProfileIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  percentage?: number; // 0 a 100
  showProgress?: boolean;
  avatarUrl?: string;
  username?: string;
}

export default function ProfileIcon({
  size = 40,
  percentage = 0,
  showProgress = true,
  avatarUrl,
  username = "Usuário",
  ...props
}: ProfileIconProps) {

  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size / 2) - 5;
  const imageRadius = showProgress ? radius - 8 : radius - 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference;

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      {/* SVG com progresso */}
      <svg
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${size} ${size}`}
        className="absolute top-0 left-0"
        {...props}
      >
        {showProgress && (
          <>
            {/* Círculo de fundo (progresso não preenchido) */}
            <circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              opacity="0.2"
            />
            
            {/* Círculo de progresso */}
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
      </svg>

      {/* Foto de perfil */}
      <div 
        className="absolute rounded-full overflow-hidden bg-gray-200"
        style={{
          width: imageRadius * 2,
          height: imageRadius * 2,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <Image
          src={avatarUrl || "/AbstractUser.png"}
          alt={`Foto de perfil de ${username}`}
          width={imageRadius * 2}
          height={imageRadius * 2}
          className="object-cover w-full h-full"
          onError={(e) => { 
            e.currentTarget.src = "/AbstractUser.png"; 
          }}
        />
      </div>
    </div>
  );
}