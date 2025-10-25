import React from "react";

type EyeOffProps = {
  className?: string;
};

const EyeOff: React.FC<EyeOffProps> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3l18 18M10.58 10.58A3 3 0 0113.42 13.42M4.93 4.93s3-3 7-3 7 3 7 3 3 3 3 7-3 7-3 7l-7-7"
      />
    </svg>
  );
};

export default EyeOff;
