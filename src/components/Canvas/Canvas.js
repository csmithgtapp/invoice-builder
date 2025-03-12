// src/components/Canvas/Canvas.js
import React, { useRef, useState } from 'react';
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
  const [dragOverId, setDragOverId] = useState(null);

  // Clear selection when clicking on the canvas background
  const handleCanvasClick = (e) => {
    // Only clear if we clicked directly on the canvas, not on an element
    if (e.target === canvasRef.current || e.target.classList.contains('canvas-inner')) {
      setSelectedElement(null);
    }
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

  // Handle drop of element from toolbar
  const handleDrop = (e) => {
    e.preventDefault();
    const elementType = e.dataTransfer.getData('element-type');
    
    if (elementType) {
      // Get canvas position relative to viewport
      const canvasRect = canvasRef.current.getBoundingClientRect();
      
      // Calculate drop position relative to canvas
      const x = Math.max(0, e.clientX - canvasRect.left);
      const y = Math.max(0, e.clientY - canvasRect.top);
      
      // Create new element with default properties for this type
      const newElement = createElementOfType(elementType, x, y);
      
      // Add new element to elements array
      setElements([...elements, newElement]);
      setSelectedElement(newElement.id);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Allow drop
    // Change cursor to indicate droppable
    e.dataTransfer.dropEffect = 'copy';
  };

  return (
    <div 
      className="flex-1 bg-gray-200 overflow-auto p-8"
      onClick={handleCanvasClick}
    >
      <div 
        ref={canvasRef}
        className="relative mx-auto w-[600px] h-[842px] bg-white shadow-lg border-2 border-gray-300 canvas-inner"
        style={{ minHeight: '842px' }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
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
            isDragOver={dragOverId === element.id}
            setDragOverId={setDragOverId}
          />
        ))}
      </div>
    </div>
  );
};

// Helper function to create elements
const createElementOfType = (type, x, y) => {
  return {
    id: Date.now().toString(),
    type,
    x,
    y,
    width: getDefaultWidth(type),
    height: getDefaultHeight(type),
    content: getDefaultContent(type),
    zIndex: 1,
    style: getDefaultStyle(type),
  };
};

// Default properties helpers
const getDefaultWidth = (type) => {
  switch(type) {
    case 'heading': return 350;
    case 'text': return 300;
    case 'image': return 200;
    case 'rectangle': return 150;
    case 'list': return 250;
    case 'table': return 500;
    case 'dataField': return 200;
    default: return 200;
  }
};

const getDefaultHeight = (type) => {
  switch(type) {
    case 'heading': return 60;
    case 'text': return 100;
    case 'image': return 150;
    case 'rectangle': return 100;
    case 'list': return 150;
    case 'table': return 200;
    case 'dataField': return 30;
    default: return 100;
  }
};

const getDefaultContent = (type) => {
  switch(type) {
    case 'heading': return 'Document Heading';
    case 'text': return 'Edit this text block with your content. You can resize and position it as needed.';
    case 'list': return ['Item 1', 'Item 2', 'Item 3'];
    case 'table': return 'items';
    case 'dataField': return '{dataField}';
    default: return null;
  }
};

const getDefaultStyle = (type) => {
  switch(type) {
    case 'heading': return { fontWeight: 'bold', fontSize: '24px' };
    case 'text': return { fontSize: '16px' };
    case 'rectangle': return { backgroundColor: '#e2e8f0', border: '1px solid #cbd5e0' };
    default: return {};
  }
};

export default Canvas;