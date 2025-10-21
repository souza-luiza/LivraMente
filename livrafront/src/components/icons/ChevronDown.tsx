interface ChevronDownIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export default function ChevronDownIcon({
  size,
  ...props }: ChevronDownIconProps) {

  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      stroke="currentColor"
      {...props}
    >
      <path d="M10 15L20 25L30 15" fill="none" strokeWidth="2" />
    </svg>
  );
}