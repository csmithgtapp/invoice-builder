import React, { useRef } from 'react';
import CanvasElement from './CanvasElement';

const Canvas = ({ 
  elements, 
  setElements, 
  selectedElement, 
  setSelectedElement,
  orderData,
  showPlaceholders
}) => {
  const canvasRef = useRef(null);

  // Clear selection when clicking on the canvas background
  const handleCanvasClick = () => {
    setSelectedElement(null);
  };

  // Helper function to get value from order data based on path
  const getValueFromPath = (path) => {
    if (!orderData || !path) return null;
    
    const getValue = (obj, path) => {
      return path.split('.').reduce((prev, current) => {
        return prev ? prev[current] : null;
      }, obj);
    };
    
    return getValue(orderData, path);
  };

  return (
    <div 
      className="flex-1 bg-gray-200 overflow-auto p-8"
      onClick={handleCanvasClick}
    >
      <div 
        ref={canvasRef}
        className="relative mx-auto w-[600px] h-[842px] bg-white shadow-lg border-2 border-gray-400"
        style={{ minHeight: '842px' }}
      >
        {elements.map(element => (
          <CanvasElement
            key={element.id}
            element={element}
            isSelected={selectedElement === element.id}
            onSelect={() => setSelectedElement(element.id)}
            onChange={(updatedElement) => {
              setElements(elements.map(el => 
                el.id === element.id ? updatedElement : el
              ));
            }}
            canvasRef={canvasRef}
            orderData={orderData}
            showPlaceholders={showPlaceholders}
            getValueFromPath={getValueFromPath}
          />
        ))}
      </div>
    </div>
  );
};

export default Canvas;