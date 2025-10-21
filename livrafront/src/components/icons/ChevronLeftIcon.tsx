interface ChevronLeftIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export default function ChevronLeftIcon({
  size,
  ...props }: ChevronLeftIconProps) {

  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      stroke="currentColor"
      {...props}
    >
      <path d="M25 30L15 20L25 10" fill="none" strokeWidth="2" />
</svg>
  );
}