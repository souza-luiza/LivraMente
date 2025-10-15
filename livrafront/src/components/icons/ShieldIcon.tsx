interface ShieldIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export default function ShieldIcon({
  size,
  ...props }: ShieldIconProps) {

  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      stroke="currentColor"
      {...props}
    >
      <path d="M19.9998 36.6667C19.9998 36.6667 33.3332 30 33.3332 20V8.33337L19.9998 3.33337L6.6665 8.33337V20C6.6665 30 19.9998 36.6667 19.9998 36.6667Z" fill="none" strokeWidth="2" />
</svg>

  );
}