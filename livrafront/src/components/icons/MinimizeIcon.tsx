interface MinimizeIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export default function MinimizeIcon({
  size,
  ...props }: MinimizeIconProps) {

  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      stroke="currentColor"
      {...props}
    >
      <path d="M13.3333 5V10C13.3333 10.8841 12.9821 11.7319 12.357 12.357C11.7319 12.9821 10.8841 13.3333 10 13.3333H5M35 13.3333H30C29.1159 13.3333 28.2681 12.9821 27.643 12.357C27.0179 11.7319 26.6667 10.8841 26.6667 10V5M26.6667 35V30C26.6667 29.1159 27.0179 28.2681 27.643 27.643C28.2681 27.0179 29.1159 26.6667 30 26.6667H35M5 26.6667H10C10.8841 26.6667 11.7319 27.0179 12.357 27.643C12.9821 28.2681 13.3333 29.1159 13.3333 30V35" fill="none" strokeWidth="2"/>
</svg>
  );
}