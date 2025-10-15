interface DropletIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export default function DropletIcon({
  size,
  ...props }: DropletIconProps) {

  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      stroke="currentColor"
      {...props}
    >
      <path d="M19.9998 4.48328L29.4331 13.9166C31.2987 15.781 32.5695 18.1567 33.0846 20.7434C33.5998 23.33 33.3363 26.0114 32.3274 28.4482C31.3185 30.8851 29.6095 32.968 27.4167 34.4334C25.2238 35.8989 22.6456 36.6811 20.0081 36.6811C17.3707 36.6811 14.7925 35.8989 12.5996 34.4334C10.4068 32.968 8.69783 30.8851 7.68891 28.4482C6.68 26.0114 6.41647 23.33 6.93165 20.7434C7.44682 18.1567 8.71757 15.781 10.5831 13.9166L19.9998 4.48328Z" fill="none" strokeWidth="2" />
</svg>
  );
}