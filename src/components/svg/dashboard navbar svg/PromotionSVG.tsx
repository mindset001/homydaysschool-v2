const PromotionSVG = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth={1.8}
    stroke="currentColor"
    className="size-full"
  >
    {/* Up arrow */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
    {/* People silhouettes */}
    <circle cx="5" cy="19" r="1.5" />
    <circle cx="12" cy="19" r="1.5" />
    <circle cx="19" cy="19" r="1.5" />
  </svg>
);

export default PromotionSVG;
