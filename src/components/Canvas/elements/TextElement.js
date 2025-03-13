import React from 'react';

const TextElement = ({ element, onChange, isSelected }) => {
  const handleTextChange = (e) => {
    onChange({ ...element, content: e.target.value });
  };

  // Prevent propagation to parent when clicking in the textarea
  const handleClick = (e) => {
    e.stopPropagation();
  };

  return (
    <textarea
      className="w-full h-full p-2 resize-none border-none focus:outline-none"
      value={element.content || ''}
      onChange={handleTextChange}
      onClick={handleClick}
      style={{
        ...element.style,
        pointerEvents: isSelected ? 'auto' : 'none',
        backgroundColor: 'transparent'
      }}
      disabled={!isSelected}
    />
  );
};

export default TextElement;