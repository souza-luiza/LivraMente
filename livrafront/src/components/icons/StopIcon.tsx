interface StopIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export default function StopIcon({
  size,
  ...props }: StopIconProps) {

  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      fill="currentColor"
      {...props}
    >
      <path d="M20.001 2.33301C29.7576 2.33345 37.6669 10.2434 37.667 20C37.6668 29.7566 29.7575 37.6656 20.001 37.666C10.2441 37.666 2.33318 29.7569 2.33301 20C2.33314 10.2431 10.244 2.33301 20.001 2.33301ZM20.001 4.33301C11.3486 4.33301 4.33412 11.3477 4.33398 20C4.33416 28.6523 11.3486 35.666 20.001 35.666C28.653 35.6656 35.6668 28.652 35.667 20C35.6669 11.3479 28.653 4.33345 20.001 4.33301ZM25 14C25.5523 14 26 14.4477 26 15V25C26 25.5523 25.5523 26 25 26H15C14.4477 26 14 25.5523 14 25V15C14 14.4477 14.4477 14 15 14H25ZM16 24H24V16H16V24Z" />
</svg>

  );
}