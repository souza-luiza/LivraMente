interface FolderIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export default function FolderIcon({
  size,
  ...props }: FolderIconProps) {

  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      stroke="currentColor"
      {...props}
    >
      <path d="M36.6668 31.6667C36.6668 32.5507 36.3156 33.3986 35.6905 34.0237C35.0654 34.6488 34.2176 35 33.3335 35H6.66683C5.78277 35 4.93493 34.6488 4.30981 34.0237C3.68469 33.3986 3.3335 32.5507 3.3335 31.6667V8.33333C3.3335 7.44928 3.68469 6.60143 4.30981 5.97631C4.93493 5.35119 5.78277 5 6.66683 5H15.0002L18.3335 10H33.3335C34.2176 10 35.0654 10.3512 35.6905 10.9763C36.3156 11.6014 36.6668 12.4493 36.6668 13.3333V31.6667Z" fill="none" strokeWidth="2" />
</svg>
  );
}