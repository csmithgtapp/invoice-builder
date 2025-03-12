import React, { useState, useEffect } from 'react';
import { Move } from 'lucide-react';
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
  getValueFromPath
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState('');
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Handle mouse down on element
  const handleMouseDown = (e) => {
    e.stopPropagation();
    onSelect();
    
    // Calculate offset from element's position
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);
    
    console.log('Mouse down on element:', element.id);
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
    console.log('Starting resize:', direction);
  };

  // Handle mouse move for dragging and resizing
  const handleMouseMove = (e) => {
    if (isDragging && !isResizing) {
      // Handle dragging
      console.log('Dragging element:', element.id);
      
      if (!canvasRef.current) return;
      
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const x = Math.max(0, e.clientX - canvasRect.left - dragOffset.x);
      const y = Math.max(0, e.clientY - canvasRect.top - dragOffset.y);
      
      onChange({ ...element, x, y });
    } else if (isResizing) {
      // Handle resizing
      console.log('Resizing element:', element.id);
      
      const deltaX = e.clientX - dragOffset.x;
      const deltaY = e.clientY - dragOffset.y;
      let newWidth = element.width;
      let newHeight = element.height;
      let newX = element.x;
      let newY = element.y;
      
      // Update dimensions based on resize direction
      if (resizeDirection.includes('e')) {
        newWidth = Math.max(50, element.width + deltaX);
      }
      if (resizeDirection.includes('s')) {
        newHeight = Math.max(50, element.height + deltaY);
      }
      if (resizeDirection.includes('w')) {
        newWidth = Math.max(50, element.width - deltaX);
        newX = element.x + deltaX;
      }
      if (resizeDirection.includes('n')) {
        newHeight = Math.max(50, element.height - deltaY);
        newY = element.y + deltaY;
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
      console.log('Ending drag/resize');
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
  }, [isDragging, isResizing, dragOffset, element]);

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
      className={`absolute border-2 ${isSelected ? 'border-blue-500' : 'border-gray-300'}`}
      style={{
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        zIndex: element.zIndex,
        cursor: isDragging ? 'grabbing' : 'grab',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        boxShadow: isSelected ? '0 0 10px rgba(0, 0, 0, 0.2)' : 'none',
      }}
      onMouseDown={handleMouseDown}
    >
      {renderElementContent()}
      
      {/* Resize handles - only show for selected element */}
      {isSelected && (
        <>
          <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs p-1 rounded-t">
            <Move size={16} /> Drag
          </div>
          
          {/* Corner and edge resize handles */}
          <div
            className="absolute top-0 left-0 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize -translate-x-1/2 -translate-y-1/2"
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
          />
          <div
            className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize translate-x-1/2 -translate-y-1/2"
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
          />
          <div
            className="absolute bottom-0 left-0 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize -translate-x-1/2 translate-y-1/2"
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
          />
          <div
            className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize translate-x-1/2 translate-y-1/2"
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          />
          <div
            className="absolute top-0 left-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-n-resize -translate-x-1/2 -translate-y-1/2"
            onMouseDown={(e) => handleResizeStart(e, 'n')}
          />
          <div
            className="absolute bottom-0 left-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-s-resize -translate-x-1/2 translate-y-1/2"
            onMouseDown={(e) => handleResizeStart(e, 's')}
          />
          <div
            className="absolute left-0 top-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-w-resize -translate-x-1/2 -translate-y-1/2"
            onMouseDown={(e) => handleResizeStart(e, 'w')}
          />
          <div
            className="absolute right-0 top-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-e-resize translate-x-1/2 -translate-y-1/2"
            onMouseDown={(e) => handleResizeStart(e, 'e')}
          />
        </>
      )}
    </div>
  );
};

export default CanvasElement;