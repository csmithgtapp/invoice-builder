import React from 'react';

const TextElement = ({ element, onChange }) => {
  const handleTextChange = (e) => {
    onChange({ ...element, content: e.target.value });
  };

  return (
    <textarea
      className="w-full h-full p-2 resize-none border-none focus:outline-none"
      value={element.content}
      onChange={handleTextChange}
      onClick={(e) => e.stopPropagation()}
      style={element.style}
    />
  );
};

export default TextElement;