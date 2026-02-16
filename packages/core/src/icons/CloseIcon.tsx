import React from 'react';

export interface CloseIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export const CloseIcon = React.forwardRef<SVGSVGElement, CloseIconProps>(
  ({ size = 24, width, height, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={width ?? size}
      height={height ?? size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </svg>
  ),
);

CloseIcon.displayName = 'CloseIcon';
