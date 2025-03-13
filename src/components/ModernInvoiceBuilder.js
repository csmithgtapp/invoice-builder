import OrderService from '../services/OrderService';
import PDFGenerator from '../services/PDFGenerator';

import React, { useState, useEffect } from 'react';
import { Save, Download, FileText, Trash2, Move, Plus, Settings, 
  EyeOff, Eye, FileDown, LayoutGrid, 
  Square, List, Table } from 'lucide-react';

const ModernInvoiceBuilder = () => {
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentDragItem, setCurrentDragItem] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Sample elements for the canvas
  useEffect(() => {
    setElements([
      {
        id: '1',
        type: 'heading',
        x: 200,
        y: 50,
        width: 250,
        height: 40,
        content: 'COMMERCIAL INVOICE',
        style: { fontWeight: 'bold', fontSize: '18px', textAlign: 'center' },
        zIndex: 1
      },
      {
        id: '2',
        type: 'text',
        x: 50,
        y: 120,
        width: 200,
        height: 80,
        content: 'From:\nYour Company Name\n123 Business St\nCity, State, ZIP',
        style: { fontSize: '12px' },
        zIndex: 2
      },
      {
        id: '3',
        type: 'text',
        x: 350,
        y: 120,
        width: 200,
        height: 80,
        content: 'Invoice #: INV-12345\nDate: 2025-03-12\nDue Date: 2025-04-11',
        style: { fontSize: '12px' },
        zIndex: 3
      }
    ]);
    
    // Mock order data
    setOrderData({
      id: "INV-12345",
      customerName: "Sample Customer Inc.",
      items: [
        { name: "Product A", quantity: 2, unitPrice: 29.99, total: 59.98 },
        { name: "Product B", quantity: 1, unitPrice: 99.99, total: 99.99 }
      ],
      total: 159.97
    });
  }, []);
  
  // Handle drag start from sidebar
  const handleDragStart = (e, elementType) => {
    setCurrentDragItem(elementType);
    e.dataTransfer.setData('element-type', elementType);
    setIsDragging(true);
  };
  
  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
    setCurrentDragItem(null);
  };
  
  // Handle drop on canvas
  const handleDrop = (e) => {
    e.preventDefault();
    const elementType = e.dataTransfer.getData('element-type');
    
    if (elementType) {
      const canvasRect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - canvasRect.left;
      const y = e.clientY - canvasRect.top;
      
      // Create new element at drop position
      const newElement = {
        id: Date.now().toString(),
        type: elementType,
        x,
        y,
        width: getDefaultWidth(elementType),
        height: getDefaultHeight(elementType),
        content: getDefaultContent(elementType),
        style: {},
        zIndex: elements.length + 1
      };
      
      setElements([...elements, newElement]);
    }
    
    setIsDragging(false);
  };
  
  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };
  
  // Helper for default element properties
  const getDefaultWidth = (type) => {
    switch(type) {
      case 'heading': return 300;
      case 'text': return 200;
      case 'table': return 500;
      default: return 150;
    }
  };
  
  const getDefaultHeight = (type) => {
    switch(type) {
      case 'heading': return 50;
      case 'text': return 100;
      case 'table': return 200;
      default: return 100;
    }
  };
  
  const getDefaultContent = (type) => {
    switch(type) {
      case 'heading': return 'Document Heading';
      case 'text': return 'Text content goes here';
      case 'table': return 'items';
      default: return '';
    }
  };
  
  // Drag element on canvas
  const handleElementDrag = (e, element) => {
    if (e.buttons !== 1) return; // Only process left mouse button
    
    const canvasRect = document.getElementById('invoice-canvas').getBoundingClientRect();
    const newX = Math.max(0, Math.min(e.clientX - canvasRect.left - 20, canvasRect.width - element.width));
    const newY = Math.max(0, Math.min(e.clientY - canvasRect.top - 20, canvasRect.height - element.height));
    
    setElements(elements.map(el => 
      el.id === element.id 
        ? { ...el, x: newX, y: newY }
        : el
    ));
  };
  
  // Render content for element
  const renderElementContent = (element) => {
    switch(element.type) {
      case 'heading':
      case 'text':
        return (
          <div 
            className="w-full h-full p-2 overflow-hidden" 
            style={element.style}
          >
            {element.content.split('\n').map((line, i) => (
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
        return <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs">Table</div>;
      case 'image':
        return <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs">Image</div>;
      case 'rectangle':
        return <div className="w-full h-full bg-gray-100" />;
      case 'list':
        return (
          <div className="w-full h-full p-2">
            <ul className="list-disc pl-4 text-xs">
              <li>Item 1</li>
              <li>Item 2</li>
              <li>Item 3</li>
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top navbar */}
      <div className="bg-white border-b border-gray-200 p-3 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="text-xl font-semibold">Document Builder</div>
        </div>
        <div className="flex space-x-2">
          <button className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-md flex items-center text-sm font-medium">
            <Eye size={16} className="mr-1.5" /> Preview
          </button>
          <button className="bg-green-50 text-green-600 px-3 py-1.5 rounded-md flex items-center text-sm font-medium">
            <Save size={16} className="mr-1.5" /> Save
          </button>
<button 
  className="bg-blue-600 text-white px-3 py-1.5 rounded-md flex items-center text-sm font-medium"
  onClick={() => {
    const pdfGenerator = new PDFGenerator();
    pdfGenerator.generatePDF(elements, orderData, orderData.id);
  }}
>
  <Download size={16} className="mr-1.5" /> Export PDF
</button>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* Search */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search elements..."
                className="w-full bg-gray-50 border border-gray-200 rounded-md py-1.5 px-3 text-sm"
              />
            </div>
          </div>
          
          {/* Element categories */}
          <div className="flex px-3 pt-3 border-b border-gray-200">
            <button className="px-2.5 py-1.5 text-xs font-medium text-gray-900 rounded-md border-b-2 border-blue-500">
              Elements
            </button>
            <button className="px-2.5 py-1.5 text-xs font-medium text-gray-500 rounded-md">
              Data Fields
            </button>
            <button className="px-2.5 py-1.5 text-xs font-medium text-gray-500 rounded-md">
              Templates
            </button>
          </div>
          
          {/* Elements */}
          <div className="p-3 flex-1 overflow-y-auto">
            <div className="text-xs font-medium text-gray-500 uppercase mb-2">Basic Elements</div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div 
                className="bg-white border border-gray-200 rounded-md p-2 flex flex-col items-center justify-center text-gray-700 hover:bg-gray-50 cursor-grab"
                draggable
                onDragStart={(e) => handleDragStart(e, 'heading')}
                onDragEnd={handleDragEnd}
              >
                <div className="mb-1 font-bold text-lg">H</div>
                <span className="text-xs">Heading</span>
              </div>
              
              <div 
                className="bg-white border border-gray-200 rounded-md p-2 flex flex-col items-center justify-center text-gray-700 hover:bg-gray-50 cursor-grab"
                draggable
                onDragStart={(e) => handleDragStart(e, 'text')}
                onDragEnd={handleDragEnd}
              >
                <div className="mb-1 font-normal text-lg">T</div>
                <span className="text-xs">Text</span>
              </div>
              
              <div 
                className="bg-white border border-gray-200 rounded-md p-2 flex flex-col items-center justify-center text-gray-700 hover:bg-gray-50 cursor-grab"
                draggable
                onDragStart={(e) => handleDragStart(e, 'table')}
                onDragEnd={handleDragEnd}
              >
                <Table size={20} className="mb-1" />
                <span className="text-xs">Table</span>
              </div>
              
              <div 
                className="bg-white border border-gray-200 rounded-md p-2 flex flex-col items-center justify-center text-gray-700 hover:bg-gray-50 cursor-grab"
                draggable
                onDragStart={(e) => handleDragStart(e, 'image')}
                onDragEnd={handleDragEnd}
              >
                <div className="mb-1 border border-gray-300 w-5 h-5 flex items-center justify-center">
                  <span className="text-xs">img</span>
                </div>
                <span className="text-xs">Image</span>
              </div>
              
              <div 
                className="bg-white border border-gray-200 rounded-md p-2 flex flex-col items-center justify-center text-gray-700 hover:bg-gray-50 cursor-grab"
                draggable
                onDragStart={(e) => handleDragStart(e, 'rectangle')}
                onDragEnd={handleDragEnd}
              >
                <Square size={20} className="mb-1" />
                <span className="text-xs">Shape</span>
              </div>
              
              <div 
                className="bg-white border border-gray-200 rounded-md p-2 flex flex-col items-center justify-center text-gray-700 hover:bg-gray-50 cursor-grab"
                draggable
                onDragStart={(e) => handleDragStart(e, 'list')}
                onDragEnd={handleDragEnd}
              >
                <List size={20} className="mb-1" />
                <span className="text-xs">List</span>
              </div>
            </div>
            
            <div className="text-xs font-medium text-gray-500 uppercase mb-2">Data Fields</div>
            <div className="space-y-1 mb-4">
              <div className="bg-white border border-gray-200 rounded-md p-2 flex items-center text-gray-700 hover:bg-gray-50 cursor-grab">
                <span className="text-xs font-medium">Customer Name</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-md p-2 flex items-center text-gray-700 hover:bg-gray-50 cursor-grab">
                <span className="text-xs font-medium">Invoice Number</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-md p-2 flex items-center text-gray-700 hover:bg-gray-50 cursor-grab">
                <span className="text-xs font-medium">Items Table</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-md p-2 flex items-center text-gray-700 hover:bg-gray-50 cursor-grab">
                <span className="text-xs font-medium">Total Amount</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main canvas area */}
        <div className="flex-1 bg-gray-100 overflow-auto flex items-center justify-center p-6">
          <div 
            id="invoice-canvas"
            className="bg-white shadow-xl w-[595px] h-[842px] relative"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {/* Render elements */}
            {elements.map((element) => (
              <div
                key={element.id}
                className={`absolute ${selectedElement === element.id ? 'outline-blue-500 outline outline-2' : ''}`}
                style={{
                  left: `${element.x}px`,
                  top: `${element.y}px`,
                  width: `${element.width}px`,
                  height: `${element.height}px`,
                  zIndex: element.zIndex,
                  cursor: 'move',
                }}
                onClick={() => setSelectedElement(element.id)}
                onMouseMove={(e) => selectedElement === element.id && handleElementDrag(e, element)}
              >
                {renderElementContent(element)}
                
                {selectedElement === element.id && (
                  <div className="absolute -top-5 left-0 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded flex items-center">
                    <Move size={12} className="mr-1" />
                    <span>{element.type}</span>
                  </div>
                )}
              </div>
            ))}
            
            {/* Drop indicator when dragging */}
            {isDragging && (
              <div className="absolute inset-0 border-2 border-blue-400 border-dashed pointer-events-none z-50 flex items-center justify-center">
                <div className="bg-blue-100 text-blue-600 rounded px-2 py-1 text-sm">
                  Drop {currentDragItem} here
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Right properties panel */}
        {selectedElement && (
          <div className="w-64 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="p-3 border-b border-gray-200 font-medium">Element Properties</div>
            
            <div className="p-3">
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">Position</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500">X</label>
                    <input 
                      type="number" 
                      className="w-full text-xs border border-gray-200 rounded p-1"
                      value={elements.find(e => e.id === selectedElement)?.x || 0}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">Y</label>
                    <input 
                      type="number" 
                      className="w-full text-xs border border-gray-200 rounded p-1"
                      value={elements.find(e => e.id === selectedElement)?.y || 0}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">Size</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500">Width</label>
                    <input 
                      type="number" 
                      className="w-full text-xs border border-gray-200 rounded p-1"
                      value={elements.find(e => e.id === selectedElement)?.width || 0}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">Height</label>
                    <input 
                      type="number" 
                      className="w-full text-xs border border-gray-200 rounded p-1"
                      value={elements.find(e => e.id === selectedElement)?.height || 0}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">Content</label>
                <textarea 
                  className="w-full text-xs border border-gray-200 rounded p-1 h-20"
                  value={elements.find(e => e.id === selectedElement)?.content || ''}
                ></textarea>
              </div>
              
              <div className="flex space-x-2 mb-3">
                <button className="flex-1 bg-red-50 text-red-600 rounded p-1 text-xs flex items-center justify-center">
                  <Trash2 size={12} className="mr-1" />
                  Delete
                </button>
                <button className="flex-1 bg-blue-50 text-blue-600 rounded p-1 text-xs flex items-center justify-center">
                  <Settings size={12} className="mr-1" />
                  Styles
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernInvoiceBuilder;