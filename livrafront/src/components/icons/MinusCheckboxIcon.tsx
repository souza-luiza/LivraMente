interface MinusCheckboxIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export default function MinusCheckboxIcon({
  size,
  ...props }: MinusCheckboxIconProps) {

  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      fill="currentColor"
      {...props}
    >
      <path d="M31.667 4C34.06 4.00018 35.9998 5.94003 36 8.33301V31.667C35.9998 34.06 34.06 35.9998 31.667 36H8.33301C5.94003 35.9998 4.00018 34.06 4 31.667V8.33301C4.00018 5.94003 5.94003 4.00018 8.33301 4H31.667ZM8.33301 6C7.0446 6.00018 6.00018 7.0446 6 8.33301V31.667C6.00018 32.9554 7.0446 33.9998 8.33301 34H31.667C32.9554 33.9998 33.9998 32.9554 34 31.667V8.33301C33.9998 7.0446 32.9554 6.00018 31.667 6H8.33301ZM26.667 19C27.2191 19.0003 27.667 19.4479 27.667 20C27.667 20.5521 27.2191 20.9997 26.667 21H13.334C12.7817 21 12.334 20.5523 12.334 20C12.334 19.4477 12.7817 19 13.334 19H26.667Z" />
</svg>
  );
}