interface TVIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export default function TVIcon({
  size,
  ...props }: TVIconProps) {

  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      stroke="currentColor"
      {...props}
    >
        <path d="M33.3335 11.6667H6.66683C4.82588 11.6667 3.3335 13.1591 3.3335 15.0001V33.3334C3.3335 35.1744 4.82588 36.6667 6.66683 36.6667H33.3335C35.1744 36.6667 36.6668 35.1744 36.6668 33.3334V15.0001C36.6668 13.1591 35.1744 11.6667 33.3335 11.6667Z" fill="none" strokeWidth="2"/>
        <path d="M28.3332 3.33325L19.9998 11.6666L11.6665 3.33325" fill="none" strokeWidth="2" />
    </svg>
  );
}