interface NavIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export default function NavIcon({
  size,
  ...props }: NavIconProps) {

  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      stroke="currentColor"
      {...props}
    >
      <path d="M5 18.3333L36.6667 3.33325L21.6667 34.9999L18.3333 21.6666L5 18.3333Z" fill="none" strokeWidth="2" />
</svg>
  );
}