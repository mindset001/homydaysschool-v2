import * as React from "react";

const ClassSVG = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect x="3" y="6" width="18" height="12" rx="2" fill="#05878F" />
    <rect x="7" y="10" width="2" height="2" rx="1" fill="#fff" />
    <rect x="11" y="10" width="2" height="2" rx="1" fill="#fff" />
    <rect x="15" y="10" width="2" height="2" rx="1" fill="#fff" />
  </svg>
);

export default ClassSVG;
