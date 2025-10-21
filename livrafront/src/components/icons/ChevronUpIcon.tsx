interface ChevronUpIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export default function ChevronUpIcon({
  size,
  ...props }: ChevronUpIconProps) {

  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      stroke="currentColor"
      {...props}
    >
      <path d="M30 25L20 15L10 25" fill="none" strokeWidth="2" />
    </svg>
  );
}