import React from "react";

type EyeProps = {
  className?: string;
};

const Eye: React.FC<EyeProps> = ({ className }) => {
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
        d="M12 4.5c-7 0-10 7.5-10 7.5s3 7.5 10 7.5 10-7.5 10-7.5-3-7.5-10-7.5z"
      />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
};

export default Eye;
