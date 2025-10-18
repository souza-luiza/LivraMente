interface Edit2IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export default function Edit2Icon({
  size,
  ...props }: Edit2IconProps) {

  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      stroke="currentColor"
      {...props}
    >
      <path d="M28.3335 5.0001C28.7712 4.56236 29.2909 4.21512 29.8628 3.97822C30.4348 3.74132 31.0478 3.61938 31.6668 3.61938C32.2859 3.61938 32.8989 3.74132 33.4708 3.97822C34.0428 4.21512 34.5624 4.56236 35.0002 5.0001C35.4379 5.43784 35.7851 5.95751 36.022 6.52944C36.2589 7.10138 36.3809 7.71437 36.3809 8.33343C36.3809 8.95249 36.2589 9.56548 36.022 10.1374C35.7851 10.7094 35.4379 11.229 35.0002 11.6668L12.5002 34.1668L3.3335 36.6668L5.8335 27.5001L28.3335 5.0001Z" fill="none" strokeWidth="2"/>
</svg>
  );
}