import React, { useState, useEffect, useRef } from 'react';
import { Save, Download, FileText, Trash2, Move, Plus, Settings, 
  EyeOff, Eye, FileDown, LayoutGrid, 
  Square, List, Table, Image, Type } from 'lucide-react';
import OrderService from '../services/OrderService';
import PDFGenerator from '../services/PDFGenerator';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';

// Import our improved components
import StylesPanel from './StylesPanel';
import PreviewMode from './PreviewMode';
import TextElement from './Canvas/elements/TextElement';
import ImageElement from './Canvas/elements/ImageElement';
import ListElement from './Canvas/elements/ListElement';
import DataFieldElement from './Canvas/elements/DataFieldElement';
import RectangleElement from './Canvas/elements/RectangleElement';
import TableElement from './Canvas/elements/TableElement';

const ModernInvoiceBuilderComplete = () => {
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentDragItem, setCurrentDragItem] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [orderId, setOrderId] = useState('INV-12345');
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState("elements"); // "elements", "dataFields", "templates"
  const [showStylesPanel, setShowStylesPanel] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [isDraggingElement, setIsDraggingElement] = useState(false);
  
  const canvasRef = useRef(null);
  const orderService = new OrderService();
  const pdfGenerator = new PDFGenerator();

  // Load initial data
  useEffect(() => {
    // Set some default elements for the canvas
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
    
    // Fetch mock order data
    const mockOrderData = orderService.getMockOrder('INV-12345');
    setOrderData(mockOrderData);
    
    // Load templates
    const loadTemplates = async () => {
      try {
        const templates = await orderService.getTemplates();
        setTemplates(templates);
      } catch (error) {
        console.error('Error loading templates:', error);
      }
    };
    
    loadTemplates();
  }, []);
  
  // Fetch order data by ID
  const handleFetchOrder = async (id) => {
    if (!id) return;
    
    try {
      const data = await orderService.getOrderById(id);
      setOrderData(data);
    } catch (error) {
      console.error('Error fetching order:', error);
    }
  };
  
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
      
      // For data fields, add the data field property
      if (elementType === 'dataField') {
        const dataField = e.dataTransfer.getData('data-field') || 'id';
        newElement.dataField = dataField;
        newElement.content = `{${dataField}}`;
      }
      
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
      case 'dataField': return 200;
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
      case 'dataField': return 30;
      default: return 100;
    }
  };
  
  const getDefaultContent = (type) => {
    switch(type) {
      case 'heading': return 'Document Heading';
      case 'text': return 'Text content goes here';
      case 'table': return 'items';
      case 'list': return ['Item 1', 'Item 2', 'Item 3'];
      case 'dataField': return '{dataField}';
      default: return '';
    }
  };
  
  const getDefaultStyle = (type) => {
    switch(type) {
      case 'heading': return { fontWeight: 'bold', fontSize: '18px', textAlign: 'center' };
      case 'text': return { fontSize: '14px' };
      case 'rectangle': return { backgroundColor: '#e2e8f0' };
      case 'dataField': return { fontSize: '14px' };
      default: return {};
    }
  };
// Improved drag handler with smoother movement
const handleElementDrag = (e, element) => {
  if (e.buttons !== 1) return; // Only process left mouse button
  
  // Store reference to prevent stale closures
  const el = elements.find(el => el.id === element.id);
  if (!el) return;
  
  // Get canvas boundaries
  const canvasRect = canvasRef.current.getBoundingClientRect();
  
  // Calculate new position with boundary checking
  const newX = Math.max(0, Math.min(e.clientX - canvasRect.left, canvasRect.width - el.width));
  const newY = Math.max(0, Math.min(e.clientY - canvasRect.top, canvasRect.height - el.height));
  
  // Only update if position actually changed (reduces rerenders)
  if (newX !== el.x || newY !== el.y) {
    // Use requestAnimationFrame for smoother updates
    requestAnimationFrame(() => {
      setElements(prevElements => 
        prevElements.map(item => 
          item.id === element.id 
            ? { ...item, x: newX, y: newY }
            : item
        )
      );
    });
  }
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
  
  // Load template
  const handleLoadTemplate = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template && template.elements) {
      setElements(template.elements);
    }
  };
  
  // Save current as template
  const saveAsTemplate = () => {
    const templateName = prompt('Enter a name for this template:');
    if (!templateName) return;
    
    const newTemplate = {
      id: `template-${Date.now()}`,
      name: templateName,
      type: 'invoice',
      elements: elements
    };
    
    setTemplates([...templates, newTemplate]);
    
    // In a real app, you would save this to the backend
    const saveTemplate = async () => {
      try {
        await orderService.saveTemplate(newTemplate);
        alert('Template saved successfully!');
      } catch (error) {
        console.error('Error saving template:', error);
      }
    };
    
    saveTemplate();
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
        return (
          <TableElement 
            element={element}

            data={orderData?.items || []}
          />
        );
      case 'image':
        return (
          <ImageElement 
            element={element} 
            onChange={updateElement}
          />
        );
      case 'rectangle':
        return (
          <RectangleElement 
            style={element.style}
          />
        );
      case 'list':
        return (
          <ListElement 
            element={element}
            onChange={updateElement}
            isSelected={isSelected}
          />
        );
      case 'dataField':
        return (
          <DataFieldElement 
            element={element}
            orderData={orderData}
            onChange={updateElement}
            isSelected={isSelected}
          />
        );
      default:
        return null;
    }
  };

  // Handle PDF Export
  const handleExportPDF = () => {
    // Helper function to get value from path
    const getValueFromPath = (path) => {
      if (!orderData || !path) return null;
      
      return path.split('.').reduce((prev, current) => {
        return prev ? prev[current] : null;
      }, orderData);
    };
    
    pdfGenerator.generatePDF(elements, orderData, orderData.id, getValueFromPath);
  };
  
  // Handle save
  const handleSave = () => {
    // In a real app, you would save this to the backend
    alert('Document saved successfully!');
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
              {orderData ? (
                Object.entries(orderData).map(([key, value]) => {
                  // Don't show items array as a data field
                  if (key === 'items' || typeof value === 'object') return null;
                  
                  return (
                    <div 
                      key={key}
                      className="bg-white border border-gray-200 rounded-md p-2 flex items-center text-gray-700 hover:bg-gray-50 cursor-grab"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('element-type', 'dataField');
                        e.dataTransfer.setData('data-field', key);
                        handleDragStart(e, 'dataField');
                      }}
                      onDragEnd={handleDragEnd}
                    >
                      <span className="text-xs font-medium">{key}: {value}</span>
                    </div>
                  );
                })
              ) : (
                <div className="p-2 text-xs text-gray-500">No order data loaded</div>
              )}
              
              {orderData && orderData.items && (
                <div 
                  className="bg-white border border-gray-200 rounded-md p-2 flex items-center text-gray-700 hover:bg-gray-50 cursor-grab"
                  draggable
                  onDragStart={(e) => {
                    handleDragStart(e, 'table');
                  }}
                  onDragEnd={handleDragEnd}
                >
                  <span className="text-xs font-medium">Items Table</span>
                </div>
              )}
            </div>
            
            <div className="border-t pt-3 mt-4">
              <div className="flex mb-2">
                <input
                  type="text"
                  placeholder="Enter Order ID"
                  className="flex-1 p-2 border rounded-l text-sm"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                />
                <button
                  className="bg-blue-600 text-white px-3 py-2 rounded-r text-sm"
                  onClick={() => handleFetchOrder(orderId)}
                >
                  Fetch
                </button>
              </div>
            </div>
          </>
        );
      case "templates":
        return (
          <>
            <div className="text-xs font-medium text-gray-500 uppercase mb-2">Templates</div>
            <div className="space-y-1 mb-4">
              <select 
                className="w-full border border-gray-200 rounded p-2 text-sm"
                onChange={(e) => handleLoadTemplate(e.target.value)}
                defaultValue=""
              >
                <option value="">Select a template</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>{template.name}</option>
                ))}
              </select>
              
              <div className="mt-2">
                <button 
                  className="w-full bg-blue-50 text-blue-600 rounded py-1.5 text-xs flex items-center justify-center"
                  onClick={saveAsTemplate}
                >
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
            
            {/* Only show content field for text-based elements */}
            {(element.type === 'text' || element.type === 'heading' || element.type === 'dataField') && (
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">Content</label>
                <textarea 
                  className="w-full text-xs border border-gray-200 rounded p-1 h-20"
                  value={element.content || ''}
                  onChange={handleContentChange}
                />
              </div>
            )}
            
            {/* Data field specific options */}
            {element.type === 'dataField' && (
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">Data Field</label>
                <select
                  className="w-full text-xs border border-gray-200 rounded p-1"
                  value={element.dataField || ''}
                  onChange={(e) => {
                    const dataField = e.target.value;
                    updateElement({
                      ...element,
                      dataField,
                      content: `{${dataField}}`
                    });
                  }}
                >
                  <option value="">Select a field</option>
                  {orderData && Object.keys(orderData).map((key) => {
                    if (key === 'items' || typeof orderData[key] === 'object') return null;
                    return (
                      <option key={key} value={key}>{key}</option>
                    );
                  })}
                </select>
              </div>
            )}
            
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
              onClick={handleSave}
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