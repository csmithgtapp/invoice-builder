import React, { useRef, useEffect } from 'react';

const TextElement = ({ element, onChange, isSelected }) => {
  const textareaRef = useRef(null);

  // Focus textarea when element is selected
  useEffect(() => {
    if (isSelected && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isSelected]);

  const handleTextChange = (e) => {
    onChange({ ...element, content: e.target.value });
  };

  // Prevent propagation to parent when clicking in the textarea
  const handleClick = (e) => {
    e.stopPropagation();
  };

  // For headings, use larger font and bold
  const getStyles = () => {
    let styles = { ...element.style };
    
    // Set default styles if not present
    if (element.type === 'heading' && !styles.fontWeight) {
      styles.fontWeight = 'bold';
    }
    
    if (element.type === 'heading' && !styles.fontSize) {
      styles.fontSize = '18px';
    }
    
    return styles;
  };

  // For display mode (when not selected)
  if (!isSelected) {
    // Handle multi-line text by splitting on newlines or escaped newlines
    let content = element.content || '';
    const lines = content.includes('\\n') ? 
      content.split('\\n') : 
      content.split('\n');
    
    return (
      <div 
        className="w-full h-full p-2 overflow-hidden" 
        style={getStyles()}
      >
        {lines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    );
  }

  // For edit mode (when selected)
  return (
    <textarea
      ref={textareaRef}
      className="w-full h-full p-2 resize-none border-none focus:outline-none"
      value={element.content || ''}
      onChange={handleTextChange}
      onClick={handleClick}
      onFocus={handleClick}
      style={{
        ...getStyles(),
        backgroundColor: 'transparent'
      }}
      placeholder={element.type === 'heading' ? 'Enter heading text' : 'Enter text content'}
    />
  );
};

export default TextElement;