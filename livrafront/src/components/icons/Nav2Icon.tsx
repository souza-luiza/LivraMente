interface Nav2IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export default function Nav2Icon({
  size,
  ...props }: Nav2IconProps) {

  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      stroke="currentColor"
      {...props}
    >
      <path d="M20.0002 3.33325L31.6668 34.9999L20.0002 28.3333L8.3335 34.9999L20.0002 3.33325Z" fill="none" strokeWidth="2" />
</svg>
  );
}