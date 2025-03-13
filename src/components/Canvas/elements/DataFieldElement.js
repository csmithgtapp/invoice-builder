import React from 'react';

const DataFieldElement = ({ element, orderData, onChange, isSelected }) => {
  // Helper function to get value from orderData based on path
  const getValueFromPath = (path) => {
    if (!orderData || !path) return null;
    
    return path.split('.').reduce((prev, current) => {
      return prev && prev[current] !== undefined ? prev[current] : null;
    }, orderData);
  };
  
  // Format the content with actual data if available
  const formatContent = () => {
    let content = element.content || '';
    
    if (element.dataField && orderData) {
      const value = getValueFromPath(element.dataField);
      if (value !== null && value !== undefined) {
        // Replace all occurrences of {dataField} with the actual value
        content = content.replace(
          new RegExp(`\\{${element.dataField}\\}`, 'g'),
          value
        );
      }
    }
    
    return content;
  };
  
  // Handle content change
  const handleContentChange = (e) => {
    onChange({
      ...element,
      content: e.target.value
    });
  };
  
  // Handle data field selection change
  const handleDataFieldChange = (e) => {
    const newDataField = e.target.value;
    
    // Update the content to use the new data field
    let newContent = element.content || '';
    if (element.dataField) {
      // Replace old data field placeholder with new one
      newContent = newContent.replace(
        new RegExp(`\\{${element.dataField}\\}`, 'g'),
        `{${newDataField}}`
      );
    } else {
      // If there was no previous data field, append the new one
      newContent = `{${newDataField}}`;
    }
    
    onChange({
      ...element,
      dataField: newDataField,
      content: newContent
    });
  };
  
  // For editing mode, show textarea
  if (isSelected) {
    return (
      <div className="w-full h-full p-1">
        <textarea
          className="w-full h-full p-1 resize-none border-none focus:outline-none"
          value={element.content || ''}
          onChange={handleContentChange}
          style={{
            ...element.style,
            backgroundColor: 'transparent'
          }}
          placeholder="Enter content with {dataField} placeholders"
        />
      </div>
    );
  }
  
  // For display mode, show formatted content
  return (
    <div 
      className="w-full h-full p-2 overflow-hidden"
      style={element.style}
    >
      {formatContent()}
    </div>
  );
};

export default DataFieldElement;