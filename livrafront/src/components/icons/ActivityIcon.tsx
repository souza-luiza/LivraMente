interface ActivityIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export default function ActivityIcon({
  size,
  ...props }: ActivityIconProps) {

  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      stroke="currentColor"
      {...props}
    >
      <path d="M36.6668 20H30.0002L25.0002 35L15.0002 5L10.0002 20H3.3335" fill="none" strokeWidth="2" />
</svg>

  );
}