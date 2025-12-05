// LinkifyText.tsx
import React from "react";

interface LinkifyTextProps {
  text?: string;
}

const LinkifyText: React.FC<LinkifyTextProps> = ({ text }) => {
  if (!text) return <>No description available.</>;

  // Regex to detect URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const parts = text.split(urlRegex);

  return (
    <>
      {parts.map((part, index) =>
        urlRegex.test(part) ? (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-600"
          >
            {part}
          </a>
        ) : (
          part
        )
      )}
    </>
  );
};

export default LinkifyText;
