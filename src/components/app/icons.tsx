import type { SVGProps } from 'react';

export const StegoShieldLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <circle cx="12" cy="12" r="3.5" stroke="none" fill="currentColor" />
    <path d="M10.5 10.5 l3 3 m0 -3 l-3 3" strokeWidth="1.5" stroke="black"/>
  </svg>
);
