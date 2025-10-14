interface BookmarkIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export default function BookmarkIcon({
  size,
  ...props }: BookmarkIconProps) {

  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      stroke="currentColor"
      {...props}
    >
      <path d="M31.6668 35L20.0002 26.6667L8.3335 35V8.33333C8.3335 7.44928 8.68469 6.60143 9.30981 5.97631C9.93493 5.35119 10.7828 5 11.6668 5H28.3335C29.2176 5 30.0654 5.35119 30.6905 5.97631C31.3156 6.60143 31.6668 7.44928 31.6668 8.33333V35Z" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
  );
}