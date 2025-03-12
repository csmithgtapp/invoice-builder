import React from 'react';

const DataFieldElement = ({ element, value }) => {
  let content = element.content;
  
  if (value !== null) {
    // Replace template variables with actual data
    content = content.replace(
      new RegExp(`\\{${element.dataField}\\}`, 'g'), 
      value
    );
  }
  
  return (
    <div 
      className="w-full h-full p-2 overflow-hidden"
      style={element.style}
    >
      {content}
    </div>
  );
};

export default DataFieldElement;