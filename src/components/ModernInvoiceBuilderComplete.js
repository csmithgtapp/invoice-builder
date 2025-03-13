import React, { useState, useEffect, useRef } from 'react';
import { Save, Download, FileText, Trash2, Move, Plus, Settings, 
  EyeOff, Eye, FileDown, LayoutGrid, 
  Square, List, Table, Image, Type, FileSpreadsheet } from 'lucide-react';
import OrderService from '../services/OrderService';
import PDFGenerator from '../services/PDFGenerator';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Input, Label, Textarea } from './ui/input';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import StylesPanel from './StylesPanel';
import PreviewMode from './PreviewMode';
import TextElement from './Canvas/elements/TextElement';
import ImageElement from './Canvas/elements/ImageElement';

const ModernInvoiceBuilderComplete = () => {
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentDragItem, setCurrentDragItem] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState("elements"); // "elements", "dataFields", "templates"
  const [showStylesPanel, setShowStylesPanel] = useState(false);
  
  const canvasRef = useRef(null);

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
        content: 'From:\\nYour Company Name\\n123 Business St\\nCity, State, ZIP',
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
        content: 'Invoice #: INV-12345\\nDate: 2025-03-12\\nDue Date: 2025-04-11',
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
        style: getDefaultStyle(elementType),
        zIndex: elements.length + 1
      };
      
      setElements([...elements, newElement]);
      setSelectedElement(newElement.id);
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
      case 'image': return 200;
      case 'rectangle': return 150;
      case 'list': return 200;
      default: return 150;
    }
  };
  
  const getDefaultHeight = (type) => {
    switch(type) {
      case 'heading': return 50;
      case 'text': return 100;
      case 'table': return 200;
      case 'image': return 150;
      case 'rectangle': return 100;
      case 'list': return 150;
      default: return 100;
    }
  };
  
  const getDefaultContent = (type) => {
    switch(type) {
      case 'heading': return 'Document Heading';
      case 'text': return 'Text content goes here';
      case 'table': return 'items';
      case 'list': return ['Item 1', 'Item 2', 'Item 3'];
      default: return '';
    }
  };
  
  const getDefaultStyle = (type) => {
    switch(type) {
      case 'heading': return { fontWeight: 'bold', fontSize: '18px', textAlign: 'center' };
      case 'text': return { fontSize: '14px' };
      case 'rectangle': return { backgroundColor: '#e2e8f0' };
      default: return {};
    }
  };
  
  // Drag element on canvas
  const handleElementDrag = (e, element) => {
    if (e.buttons !== 1) return; // Only process left mouse button
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(e.clientX - canvasRect.left, canvasRect.width - element.width));
    const newY = Math.max(0, Math.min(e.clientY - canvasRect.top, canvasRect.height - element.height));
    
    setElements(elements.map(el => 
      el.id === element.id 
        ? { ...el, x: newX, y: newY }
        : el
    ));
  };
  
  // Update element properties
  const updateElement = (updatedElement) => {
    setElements(elements.map(el => 
      el.id === updatedElement.id ? updatedElement : el
    ));
  };
  
  // Delete selected element
  const deleteElement = () => {
    if (selectedElement) {
      setElements(elements.filter(el => el.id !== selectedElement));
      setSelectedElement(null);
    }
  };
  
  // Handle preview toggle
  const togglePreview = () => {
    setShowPreview(!showPreview);
  };
  
  // Render element content based on type
  const renderElementContent = (element, isSelected) => {
    switch(element.type) {
      case 'heading':
      case 'text':
        return (
          <TextElement 
            element={element} 
            onChange={updateElement}
            isSelected={isSelected}
          />
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
        return (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs">
            <Table size={24} className="mb-2" />
            <span className="text-xs ml-2">Table</span>
          </div>
        );
      case 'image':
        return <ImageElement element={element} onChange={updateElement} />;
      case 'rectangle':
        return <div className="w-full h-full" style={{...element.style}} />;
      case 'list':
        return (
          <div className="w-full h-full p-2">
            <ul className="list-disc pl-4 text-xs">
              {Array.isArray(element.content) ? (
                element.content.map((item, index) => (
                  <li key={index}>{item}</li>
                ))
              ) : (
                <li>Item 1</li>
              )}
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  // Handle PDF Export
  const handleExportPDF = () => {
    const pdfGenerator = new PDFGenerator();
    
    // Helper function to get value from path
    const getValueFromPath = (path) => {
      if (!orderData || !path) return null;
      
      return path.split('.').reduce((prev, current) => {
        return prev ? prev[current] : null;
      }, orderData);
    };
    
    pdfGenerator.generatePDF(elements, orderData, orderData.id, getValueFromPath);
  };
  
  // Handle tabs in sidebar
  const renderTabContent = () => {
    switch(activeTab) {
      case "elements":
        return (
          <>
            <div className="text-xs font-medium text-gray-500 uppercase mb-2">Basic Elements</div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div 
                className="bg-white border border-gray-200 rounded-md p-2 flex flex-col items-center justify-center text-gray-700 hover:bg-gray-50 cursor-grab"
                draggable
                onDragStart={(e) => handleDragStart(e, 'heading')}
                onDragEnd={handleDragEnd}
              >
                <Type size={18} className="mb-1" />
                <span className="text-xs">Heading</span>
              </div>
              
              <div 
                className="bg-white border border-gray-200 rounded-md p-2 flex flex-col items-center justify-center text-gray-700 hover:bg-gray-50 cursor-grab"
                draggable
                onDragStart={(e) => handleDragStart(e, 'text')}
                onDragEnd={handleDragEnd}
              >
                <FileText size={18} className="mb-1" />
                <span className="text-xs">Text</span>
              </div>
              
              <div 
                className="bg-white border border-gray-200 rounded-md p-2 flex flex-col items-center justify-center text-gray-700 hover:bg-gray-50 cursor-grab"
                draggable
                onDragStart={(e) => handleDragStart(e, 'table')}
                onDragEnd={handleDragEnd}
              >
                <Table size={18} className="mb-1" />
                <span className="text-xs">Table</span>
              </div>
              
              <div 
                className="bg-white border border-gray-200 rounded-md p-2 flex flex-col items-center justify-center text-gray-700 hover:bg-gray-50 cursor-grab"
                draggable
                onDragStart={(e) => handleDragStart(e, 'image')}
                onDragEnd={handleDragEnd}
              >
                <Image size={18} className="mb-1" />
                <span className="text-xs">Image</span>
              </div>
              
              <div 
                className="bg-white border border-gray-200 rounded-md p-2 flex flex-col items-center justify-center text-gray-700 hover:bg-gray-50 cursor-grab"
                draggable
                onDragStart={(e) => handleDragStart(e, 'rectangle')}
                onDragEnd={handleDragEnd}
              >
                <Square size={18} className="mb-1" />
                <span className="text-xs">Shape</span>
              </div>
              
              <div 
                className="bg-white border border-gray-200 rounded-md p-2 flex flex-col items-center justify-center text-gray-700 hover:bg-gray-50 cursor-grab"
                draggable
                onDragStart={(e) => handleDragStart(e, 'list')}
                onDragEnd={handleDragEnd}
              >
                <List size={18} className="mb-1" />
                <span className="text-xs">List</span>
              </div>
            </div>
          </>
        );
      case "dataFields":
        return (
          <>
            <div className="text-xs font-medium text-gray-500 uppercase mb-2">Data Fields</div>
            <div className="space-y-1 mb-4">
              <div 
                className="bg-white border border-gray-200 rounded-md p-2 flex items-center text-gray-700 hover:bg-gray-50 cursor-grab"
                draggable
                onDragStart={(e) => handleDragStart(e, 'dataField')}
                onDragEnd={handleDragEnd}
              >
                <span className="text-xs font-medium">Customer Name</span>
              </div>
              <div 
                className="bg-white border border-gray-200 rounded-md p-2 flex items-center text-gray-700 hover:bg-gray-50 cursor-grab"
                draggable
                onDragStart={(e) => handleDragStart(e, 'dataField')}
                onDragEnd={handleDragEnd}
              >
                <span className="text-xs font-medium">Invoice Number</span>
              </div>
              <div 
                className="bg-white border border-gray-200 rounded-md p-2 flex items-center text-gray-700 hover:bg-gray-50 cursor-grab"
                draggable
                onDragStart={(e) => handleDragStart(e, 'table')}
                onDragEnd={handleDragEnd}
              >
                <span className="text-xs font-medium">Items Table</span>
              </div>
              <div 
                className="bg-white border border-gray-200 rounded-md p-2 flex items-center text-gray-700 hover:bg-gray-50 cursor-grab"
                draggable
                onDragStart={(e) => handleDragStart(e, 'dataField')}
                onDragEnd={handleDragEnd}
              >
                <span className="text-xs font-medium">Total Amount</span>
              </div>
            </div>
          </>
        );
      case "templates":
        return (
          <>
            <div className="text-xs font-medium text-gray-500 uppercase mb-2">Templates</div>
            <div className="space-y-1 mb-4">
              <select className="w-full border border-gray-200 rounded p-2 text-sm">
                <option value="">Select a template</option>
                <option value="invoice-standard">Standard Invoice</option>
                <option value="invoice-detailed">Detailed Invoice</option>
                <option value="invoice-minimal">Minimal Invoice</option>
              </select>
              <div className="mt-2">
                <button className="w-full bg-blue-50 text-blue-600 rounded py-1.5 text-xs flex items-center justify-center">
                  <Plus size={12} className="mr-1" />
                  Save Current as Template
                </button>
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  // Element Properties Panel
  const ElementPropertiesPanel = () => {
    const element = elements.find(e => e.id === selectedElement);
    
    if (!element) return null;
    
    const handlePositionChange = (property, value) => {
      const numValue = parseInt(value);
      if (!isNaN(numValue)) {
        updateElement({ ...element, [property]: numValue });
      }
    };
    
    const handleContentChange = (e) => {
      updateElement({ ...element, content: e.target.value });
    };

    return (
      <div className="p-3">
        {showStylesPanel ? (
          <StylesPanel 
            element={element} 
            updateElement={updateElement} 
            onClose={() => setShowStylesPanel(false)} 
          />
        ) : (
          <>
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-500 mb-1">Position</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500">X</label>
                  <input 
                    type="number" 
                    className="w-full text-xs border border-gray-200 rounded p-1"
                    value={element.x || 0}
                    onChange={(e) => handlePositionChange('x', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Y</label>
                  <input 
                    type="number" 
                    className="w-full text-xs border border-gray-200 rounded p-1"
                    value={element.y || 0}
                    onChange={(e) => handlePositionChange('y', e.target.value)}
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
                    value={element.width || 0}
                    onChange={(e) => handlePositionChange('width', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Height</label>
                  <input 
                    type="number" 
                    className="w-full text-xs border border-gray-200 rounded p-1"
                    value={element.height || 0}
                    onChange={(e) => handlePositionChange('height', e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-500 mb-1">Content</label>
              <textarea 
                className="w-full text-xs border border-gray-200 rounded p-1 h-20"
                value={element.content || ''}
                onChange={handleContentChange}
              />
            </div>
            
            <div className="flex space-x-2 mb-3">
              <Button 
                variant="destructive" 
                size="sm"
                onClick={deleteElement}
                className="flex-1 flex items-center justify-center"
              >
                <Trash2 size={12} className="mr-1" />
                Delete
              </Button>
              <Button 
                variant="info"
                size="sm"
                className="flex-1 flex items-center justify-center"
                onClick={() => setShowStylesPanel(true)}
              >
                <Settings size={12} className="mr-1" />
                Styles
              </Button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top navbar - Only show in edit mode */}
      {!showPreview && (
        <div className="bg-white border-b border-gray-200 p-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="text-xl font-semibold">Invoice Builder</div>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="info" 
              onClick={togglePreview}
              className="flex items-center"
            >
              <Eye size={16} className="mr-1.5" /> Preview
            </Button>
            <Button 
              variant="success"
              className="flex items-center"
            >
              <Save size={16} className="mr-1.5" /> Save
            </Button>
            <Button 
              variant="default"
              onClick={handleExportPDF}
              className="flex items-center"
            >
              <Download size={16} className="mr-1.5" /> Export PDF
            </Button>
          </div>
        </div>
      )}
      
      <div className="flex flex-1 overflow-hidden">
        {showPreview ? (
          <PreviewMode 
            elements={elements}
            orderData={orderData}
            onExitPreview={togglePreview}
            onExportPDF={handleExportPDF}
          />
        ) : (
          <>
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
              
              {/* Element categories and content */}
              <Tabs className="flex-1 flex flex-col">
                <TabsList>
                  <TabsTrigger 
                    isActive={activeTab === "elements"} 
                    onClick={() => setActiveTab("elements")}
                  >
                    Elements
                  </TabsTrigger>
                  <TabsTrigger 
                    isActive={activeTab === "dataFields"} 
                    onClick={() => setActiveTab("dataFields")}
                  >
                    Data Fields
                  </TabsTrigger>
                  <TabsTrigger 
                    isActive={activeTab === "templates"} 
                    onClick={() => setActiveTab("templates")}
                  >
                    Templates
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent>
                  {renderTabContent()}
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Main canvas area */}
            <div className="flex-1 bg-gray-100 overflow-auto flex items-center justify-center p-6">
              <div 
                ref={canvasRef}
                id="invoice-canvas"
                className="bg-white shadow-xl w-[595px] h-[842px] relative"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => setSelectedElement(null)}
              >
                {/* Render elements */}
                {elements.map((element) => {
                  const isSelected = selectedElement === element.id;
                  
                  return (
                    <div
                      key={element.id}
                      className={`absolute ${isSelected ? 'outline-blue-500 outline outline-2' : ''}`}
                      style={{
                        left: `${element.x}px`,
                        top: `${element.y}px`,
                        width: `${element.width}px`,
                        height: `${element.height}px`,
                        zIndex: isSelected ? 100 : element.zIndex,
                        cursor: 'move',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedElement(element.id);
                      }}
                      onMouseMove={(e) => isSelected && handleElementDrag(e, element)}
                    >
                      {renderElementContent(element, isSelected)}
                      
                      {isSelected && (
                        <div className="absolute -top-5 left-0 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded flex items-center">
                          <Move size={12} className="mr-1" />
                          <span>{element.type}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
                
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
                <ElementPropertiesPanel />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ModernInvoiceBuilderComplete;