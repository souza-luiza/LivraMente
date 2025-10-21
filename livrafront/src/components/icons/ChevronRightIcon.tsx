interface ChevronRightIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export default function ChevronRightIcon({
  size,
  ...props }: ChevronRightIconProps) {

  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      stroke="currentColor"
      {...props}
    >
      <path d="M15 30L25 20L15 10" fill="none" strokeWidth="2" />
    </svg>
  );
}