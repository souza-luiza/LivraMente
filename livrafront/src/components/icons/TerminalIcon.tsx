interface TerminalIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export default function TerminalIcon({
  size,
  ...props }: TerminalIconProps) {

  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      fill="currentColor"
      {...props}
    >
      <path d="M33.333 30.6663C33.8851 30.6663 34.3328 31.1142 34.333 31.6663C34.333 32.2185 33.8853 32.6662 33.333 32.6663H20C19.4477 32.6663 19 32.2185 19 31.6663C19.0003 31.1142 19.4479 30.6663 20 30.6663H33.333ZM5.95898 7.62622C6.34944 7.23576 6.98251 7.2359 7.37305 7.62622L17.373 17.6262C17.7636 18.0167 17.7636 18.6498 17.373 19.0403L7.37305 29.0403C6.98251 29.4306 6.34944 29.4307 5.95898 29.0403C5.56873 28.6498 5.56874 28.0167 5.95898 27.6262L15.252 18.3333L5.95898 9.04028C5.56873 8.64981 5.56874 8.0167 5.95898 7.62622Z" />
</svg>
  );
}