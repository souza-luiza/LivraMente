interface FilterIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export default function FilterIcon({
  size,
  ...props }: FilterIconProps) {

  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      stroke="currentColor"
      {...props}
    >
      <path d="M36.6668 5H3.3335L16.6668 20.7667V31.6667L23.3335 35V20.7667L36.6668 5Z" fill="none" strokeWidth="2" />
</svg>

  );
}