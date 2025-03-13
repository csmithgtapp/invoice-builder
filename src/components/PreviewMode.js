import React from 'react';
import { Button } from './ui/button';
import { EyeOff, Download } from 'lucide-react';

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
        let content = element.content || '';
        // Handle multiline text
        if (content.includes('\\n')) {
          content = content.split('\\n').join('\n');
        }
        
        return (
          <div 
            className="w-full h-full p-2 overflow-hidden" 
            style={element.style}
          >
            {content.split('\n').map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        );
        
      case 'table':
        if (orderData && orderData.items) {
          return (
            <div className="w-full h-full overflow-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-1 text-left">Item</th>
                    <th className="border p-1 text-center">Qty</th>
                    <th className="border p-1 text-right">Price</th>
                    <th className="border p-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orderData.items.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border p-1">{item.name}</td>
                      <td className="border p-1 text-center">{item.quantity}</td>
                      <td className="border p-1 text-right">${item.unitPrice.toFixed(2)}</td>
                      <td className="border p-1 text-right">${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return <div className="w-full h-full bg-gray-100 flex items-center justify-center">Table</div>;
        
      case 'image':
        return <div className="w-full h-full bg-gray-100 flex items-center justify-center">Image</div>;
        
      case 'rectangle':
        return <div className="w-full h-full" style={element.style} />;
        
      case 'list':
        return (
          <div className="w-full h-full p-2">
            <ul className="list-disc pl-4">
              {Array.isArray(element.content) ? (
                element.content.map((item, index) => (
                  <li key={index}>{item}</li>
                ))
              ) : (
                <>
                  <li>Item 1</li>
                  <li>Item 2</li>
                  <li>Item 3</li>
                </>
              )}
            </ul>
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