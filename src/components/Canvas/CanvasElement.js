// src/components/Canvas/CanvasElement.js
import React, { useState, useEffect, useRef } from 'react';
import { Move, GripVertical } from 'lucide-react';
import TextElement from './elements/TextElement';
import ImageElement from './elements/ImageElement';
import RectangleElement from './elements/RectangleElement';
import ListElement from './elements/ListElement';
import DataFieldElement from './elements/DataFieldElement';
import TableElement from './elements/TableElement';

const CanvasElement = ({ 
  element, 
  isSelected, 
  onSelect, 
  onChange,
  canvasRef,
  orderData,
  showPlaceholders,
  getValueFromPath,
  isDragOver,
  setDragOverId
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState('');
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const elementRef = useRef(null);

  // Handle mouse down on element
  const handleMouseDown = (e) => {
    if (e.target.classList.contains('resize-handle') || e.target.classList.contains('no-drag')) {
      return;
    }
    
    e.stopPropagation();
    onSelect();
    
    // Calculate offset from element's position
    const rect = elementRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);
  };

  // Handle resize start
  const handleResizeStart = (e, direction) => {
    e.stopPropagation();
    onSelect();
    setIsResizing(true);
    setResizeDirection(direction);
    setDragOffset({
      x: e.clientX,
      y: e.clientY
    });
  };

  // Handle mouse move for dragging and resizing
  const handleMouseMove = (e) => {
    if (isDragging && !isResizing) {
      // Handle dragging
      if (!canvasRef.current) return;
      
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - canvasRect.left - dragOffset.x, canvasRect.width - element.width));
      const y = Math.max(0, Math.min(e.clientY - canvasRect.top - dragOffset.y, canvasRect.height - element.height));
      
      onChange({ ...element, x, y });
    } else if (isResizing) {
      // Handle resizing
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const deltaX = e.clientX - dragOffset.x;
      const deltaY = e.clientY - dragOffset.y;
      
      let newWidth = element.width;
      let newHeight = element.height;
      let newX = element.x;
      let newY = element.y;
      
      // Update dimensions based on resize direction
      if (resizeDirection.includes('e')) {
        newWidth = Math.max(50, Math.min(element.width + deltaX, canvasRect.width - element.x));
      }
      if (resizeDirection.includes('s')) {
        newHeight = Math.max(50, Math.min(element.height + deltaY, canvasRect.height - element.y));
      }
      if (resizeDirection.includes('w')) {
        const maxDeltaX = element.width - 50; // Don't resize smaller than 50px
        const clampedDeltaX = Math.max(-maxDeltaX, Math.min(deltaX, element.x));
        newWidth = element.width - clampedDeltaX;
        newX = element.x + clampedDeltaX;
      }
      if (resizeDirection.includes('n')) {
        const maxDeltaY = element.height - 50; // Don't resize smaller than 50px
        const clampedDeltaY = Math.max(-maxDeltaY, Math.min(deltaY, element.y));
        newHeight = element.height - clampedDeltaY;
        newY = element.y + clampedDeltaY;
      }
      
      onChange({ 
        ...element, 
        width: newWidth, 
        height: newHeight, 
        x: newX, 
        y: newY 
      });
      
      setDragOffset({
        x: e.clientX,
        y: e.clientY
      });
    }
  };

  // Handle mouse up to end dragging or resizing
  const handleMouseUp = () => {
    if (isDragging || isResizing) {
      setIsDragging(false);
      setIsResizing(false);
    }
  };

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset]);

  // Render the appropriate element content based on type
  const renderElementContent = () => {
    switch(element.type) {
      case 'heading':
      case 'text':
        return (
          <TextElement 
            element={element} 
            onChange={onChange} 
          />
        );
      case 'image':
        return <ImageElement />;
      case 'rectangle':
        return <RectangleElement style={element.style} />;
      case 'list':
        return (
          <ListElement 
            items={element.content} 
            onChange={(newContent) => onChange({ ...element, content: newContent })} 
          />
        );
      case 'dataField':
        return (
          <DataFieldElement 
            element={element}
            value={orderData && showPlaceholders ? getValueFromPath(element.dataField) : null}
          />
        );
      case 'table':
        return (
          <TableElement 
            element={element}
            data={orderData && showPlaceholders ? getValueFromPath(element.dataField) : null}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <div
      ref={elementRef}
      className={`absolute transition-shadow ease-in-out duration-150 ${
        isSelected ? 'border-2 border-blue-500 shadow-lg' : 
        isDragOver ? 'border-2 border-green-500' : 
        'border border-gray-200'
      }`}
      style={{
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        zIndex: isSelected ? 100 : element.zIndex,
        cursor: isDragging ? 'grabbing' : 'grab',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
      }}
      onMouseDown={handleMouseDown}
    >
      {renderElementContent()}
      
      {/* Element controls - only show for selected element */}
      {isSelected && (
        <>
          <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs p-1 rounded-t flex items-center no-drag">
            <GripVertical size={14} className="mr-1" /> 
            {element.type === 'dataField' ? element.displayName || 'Data Field' : element.type.charAt(0).toUpperCase() + element.type.slice(1)}
          </div>
          
          {/* Resize handles */}
          <div
            className="absolute top-0 left-0 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize -translate-x-1/2 -translate-y-1/2 resize-handle"
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
          />
          <div
            className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize translate-x-1/2 -translate-y-1/2 resize-handle"
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
          />
          <div
            className="absolute bottom-0 left-0 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize -translate-x-1/2 translate-y-1/2 resize-handle"
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
          />
          <div
            className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize translate-x-1/2 translate-y-1/2 resize-handle"
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          />
          <div
            className="absolute top-0 left-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-n-resize -translate-x-1/2 -translate-y-1/2 resize-handle"
            onMouseDown={(e) => handleResizeStart(e, 'n')}
          />
          <div
            className="absolute bottom-0 left-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-s-resize -translate-x-1/2 translate-y-1/2 resize-handle"
            onMouseDown={(e) => handleResizeStart(e, 's')}
          />
          <div
            className="absolute left-0 top-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-w-resize -translate-x-1/2 -translate-y-1/2 resize-handle"
            onMouseDown={(e) => handleResizeStart(e, 'w')}
          />
          <div
            className="absolute right-0 top-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-e-resize translate-x-1/2 -translate-y-1/2 resize-handle"
            onMouseDown={(e) => handleResizeStart(e, 'e')}
          />
        </>
      )}
    </div>
  );
};

export default CanvasElement;