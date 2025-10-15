interface StarIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export default function StarIcon({
  size,
  ...props }: StarIconProps) {

  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      stroke="currentColor"
      {...props}
    >
      <path d="M20.0002 3.33337L25.1502 13.7667L36.6668 15.45L28.3335 23.5667L30.3002 35.0334L20.0002 29.6167L9.70016 35.0334L11.6668 23.5667L3.3335 15.45L14.8502 13.7667L20.0002 3.33337Z" fill="none" strokeWidth="2" />
</svg>

  );
}