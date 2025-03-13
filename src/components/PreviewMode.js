import React from 'react';
import { EyeOff, Download } from 'lucide-react';
import { Button } from './ui/button';
import TextElement from './Canvas/elements/TextElement';
import ImageElement from './Canvas/elements/ImageElement';
import ListElement from './Canvas/elements/ListElement';
import RectangleElement from './Canvas/elements/RectangleElement';
import TableElement from './Canvas/elements/TableElement';

const PreviewMode = ({ elements, orderData, onExitPreview, onExportPDF }) => {
  // Helper function to get value from orderData based on path
  const getValueFromPath = (path) => {
    if (!orderData || !path) return null;
    
    return path.split('.').reduce((prev, current) => {
      return prev ? prev[current] : null;
    }, orderData);
  };
  
  // Render preview content for each element
  const renderPreviewElement = (element) => {
    switch(element.type) {
      case 'heading':
      case 'text':
        // No editing in preview mode
        return (
          <div 
            className="w-full h-full p-2 overflow-hidden" 
            style={element.style}
          >
            {(element.content || '').split('\\n').map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        );
        
      case 'table':
        if (orderData && orderData.items) {
          return (
            <TableElement 
              element={element} 
              data={orderData.items}
            />
          );
        }
        return <div className="w-full h-full bg-gray-100 flex items-center justify-center">Table</div>;
        
      case 'image':
        return (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <ImageElement element={element} />
          </div>
        );
        
      case 'rectangle':
        return <RectangleElement style={element.style} />;
        
      case 'list':
        return (
          <div className="w-full h-full p-2">
            {Array.isArray(element.content) ? (
              <ul className="list-disc pl-4">
                {element.content.map((item, index) => (
                  <li key={index} style={element.style}>{item}</li>
                ))}
              </ul>
            ) : (
              <div style={element.style}>
                <ul className="list-disc pl-4">
                  <li>Item 1</li>
                  <li>Item 2</li>
                  <li>Item 3</li>
                </ul>
              </div>
            )}
          </div>
        );
        
      case 'dataField':
        let content = element.content || '';
        
        if (element.dataField && orderData) {
          // Replace template variables with actual data
          const value = getValueFromPath(element.dataField);
          if (value !== null && value !== undefined) {
            // Replace all occurrences of {dataField} with the actual value
            content = content.replace(
              new RegExp(`\\{${element.dataField}\\}`, 'g'),
              value
            );
          }
        }
        
        return (
          <div 
            className="w-full h-full p-2 overflow-hidden" 
            style={element.style}
          >
            {content}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="flex-1 bg-gray-800 p-6 flex flex-col">
      <div className="flex justify-end mb-4 space-x-2">
        <Button 
          variant="secondary" 
          size="sm"
          onClick={onExitPreview}
          className="flex items-center"
        >
          <EyeOff size={16} className="mr-1.5" /> Exit Preview
        </Button>
        
        <Button 
          variant="default" 
          size="sm"
          onClick={onExportPDF}
          className="flex items-center"
        >
          <Download size={16} className="mr-1.5" /> Export PDF
        </Button>
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white shadow-2xl w-[595px] h-[842px] relative">
          {elements.map((element) => (
            <div
              key={element.id}
              className="absolute"
              style={{
                left: `${element.x}px`,
                top: `${element.y}px`,
                width: `${element.width}px`,
                height: `${element.height}px`,
                zIndex: element.zIndex,
              }}
            >
              {renderPreviewElement(element)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PreviewMode;