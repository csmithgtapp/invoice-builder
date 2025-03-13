import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Save, Download, FileText, Trash2, Move, Plus, Settings, 
  EyeOff, Eye, FileDown, LayoutGrid, 
  Square, List, Table, Image, Type, Copy, Clipboard, Grid } from 'lucide-react';
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
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [gridSnapEnabled, setGridSnapEnabled] = useState(false);
  const [gridSize, setGridSize] = useState(10); // 10px grid
  // Zoom states
  const [zoomLevel, setZoomLevel] = useState(1);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isCanvasPanning, setIsCanvasPanning] = useState(false);
  
  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const orderService = new OrderService();
  const pdfGenerator = new PDFGenerator();

  // Handle canvas zoom
  const handleCanvasZoom = useCallback((e) => {
    // Only zoom when shift key is pressed
    if (!e.shiftKey) return;
    
    e.preventDefault();
    
    const delta = e.deltaY || e.detail || e.wheelDelta;
    
    // Get the mouse position relative to the canvas
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - canvasRect.left;
    const mouseY = e.clientY - canvasRect.top;
    
    // Calculate the point on the canvas at the mouse position before zooming
    const pointXBeforeZoom = mouseX / zoomLevel - canvasOffset.x;
    const pointYBeforeZoom = mouseY / zoomLevel - canvasOffset.y;
    
    // Calculate new zoom level (smoother by using smaller increments)
    const zoomFactor = delta > 0 ? 0.95 : 1.05;
    const newZoomLevel = Math.max(0.25, Math.min(3, zoomLevel * zoomFactor));
    
    // Calculate the point on the canvas at the mouse position after zooming
    const pointXAfterZoom = mouseX / newZoomLevel - canvasOffset.x;
    const pointYAfterZoom = mouseY / newZoomLevel - canvasOffset.y;
    
    // Adjust the canvas offset to keep the point under the mouse in the same place
    const newOffsetX = canvasOffset.x + (pointXAfterZoom - pointXBeforeZoom);
    const newOffsetY = canvasOffset.y + (pointYAfterZoom - pointYBeforeZoom);
    
    // Update state with the new zoom level and offset
    setZoomLevel(newZoomLevel);
    setCanvasOffset({ x: newOffsetX, y: newOffsetY });
  }, [zoomLevel, canvasOffset]);
  
  // Reset zoom to normal view
  const resetZoom = useCallback(() => {
    setZoomLevel(1);
    setCanvasOffset({ x: 0, y: 0 });
  }, []);
  
  // Start canvas panning - triggered when clicking on the canvas background
  const startCanvasPan = useCallback((e) => {
    // Check if we're clicking on an element or its resize handles
    // We need to check parent nodes as well, since we might be clicking on an SVG element inside the canvas
    let target = e.target;
    let isCanvas = target === canvasRef.current;
    let isGrid = false;
    
    // Check if clicking on grid SVG or lines
    if (target.tagName === 'svg' || target.tagName === 'line') {
      let parent = target.parentElement;
      while (parent) {
        if (parent === canvasRef.current) {
          isGrid = true;
          break;
        }
        parent = parent.parentElement;
      }
    }
    
    if (isCanvas || isGrid) {
      e.preventDefault();
      setIsCanvasPanning(true);
      // Add grabbing cursor
      document.body.style.cursor = 'grabbing';
    }
  }, []);
  
  // Handle panning the canvas when it's zoomed in
  const handleCanvasPan = useCallback((e) => {
    // Only enable panning when zoom level is greater than 1 and the canvas is being panned
    if (!isCanvasPanning) return;
    
    setCanvasOffset(prev => ({
      x: prev.x + e.movementX / zoomLevel,
      y: prev.y + e.movementY / zoomLevel
    }));
  }, [zoomLevel, isCanvasPanning]);
  
  // End canvas panning
  const endCanvasPan = useCallback(() => {
    if (isCanvasPanning) {
      setIsCanvasPanning(false);
      // Reset cursor
      document.body.style.cursor = '';
    }
  }, [isCanvasPanning]);
  
  // Set up zoom event listeners
  useEffect(() => {
    const canvasContainer = canvasContainerRef.current;
    if (!canvasContainer) return;
    
    const handleWheel = (e) => handleCanvasZoom(e);
    
    canvasContainer.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      canvasContainer.removeEventListener('wheel', handleWheel);
    };
  }, [handleCanvasZoom]);

  const handleMouseDown = useCallback((e, element) => {
    e.stopPropagation(); // Prevent triggering canvas panning
    setSelectedElement(element.id);
    setIsDraggingElement(element.id);
    
    // Store offset from element corner to mouse position
    const rect = e.currentTarget.getBoundingClientRect();
    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    // Calculate the offset accounting for zoom
    setDragOffset({
      x: (e.clientX - canvasRect.left) / zoomLevel - element.x + canvasOffset.x,
      y: (e.clientY - canvasRect.top) / zoomLevel - element.y + canvasOffset.y
    });
    
    // Add class to body to prevent text selection during drag
    document.body.classList.add('dragging');
  }, [zoomLevel, canvasOffset]);
  
  const handleMouseUp = useCallback(() => {
    setIsDraggingElement(null);
    document.body.classList.remove('dragging');
  }, []);

  // Helper function to snap value to grid
  const snapToGrid = (value) => {
    if (!gridSnapEnabled) return value;
    return Math.round(value / gridSize) * gridSize;
  };

  const handleElementDrag = useCallback((e, element) => {
    if (e.buttons !== 1) return; // Only process left mouse button
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    // Account for zoom level and offset when calculating position
    const scaleMouseX = (e.clientX - canvasRect.left) / zoomLevel;
    const scaleMouseY = (e.clientY - canvasRect.top) / zoomLevel;
    
    // Calculate new position with zoom adjustments
    let newX = Math.max(0, Math.min(scaleMouseX - dragOffset.x + canvasOffset.x, 
                                   595 - element.width));
    let newY = Math.max(0, Math.min(scaleMouseY - dragOffset.y + canvasOffset.y, 
                                   842 - element.height));
    
    // Apply grid snapping if enabled
    newX = snapToGrid(newX);
    newY = snapToGrid(newY);
    
    requestAnimationFrame(() => {
      setElements(prevElements => 
        prevElements.map(item => 
          item.id === element.id ? { ...item, x: newX, y: newY } : item
        )
      );
    });
  }, [dragOffset, gridSnapEnabled, gridSize, zoomLevel, canvasOffset]);

  // Handle resize start
  const handleResizeStart = useCallback((e, element, direction) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedElement(element.id);
    setIsResizing(true);
    setResizeDirection(direction);
    
    // Store initial mouse position
    setDragOffset({
      x: e.clientX,
      y: e.clientY
    });
    
    // Add class to body to prevent text selection during resize
    document.body.classList.add('resizing');
  }, []);
  
  // Handle resize
  const handleResize = useCallback((e, element) => {
    if (!isResizing || !resizeDirection) return;
    
    // Adjust movement for zoom level
    const deltaX = e.movementX / zoomLevel;
    const deltaY = e.movementY / zoomLevel;
    
    let newWidth = element.width;
    let newHeight = element.height;
    let newX = element.x;
    let newY = element.y;
    
    // Update dimensions based on resize direction
    switch (resizeDirection) {
      case 'e': // East (right)
        newWidth = Math.max(20, element.width + deltaX);
        break;
      case 's': // South (bottom)
        newHeight = Math.max(20, element.height + deltaY);
        break;
      case 'se': // Southeast (bottom-right)
        newWidth = Math.max(20, element.width + deltaX);
        newHeight = Math.max(20, element.height + deltaY);
        break;
      case 'w': // West (left)
        newWidth = Math.max(20, element.width - deltaX);
        newX = element.x + deltaX;
        break;
      case 'n': // North (top)
        newHeight = Math.max(20, element.height - deltaY);
        newY = element.y + deltaY;
        break;
      case 'nw': // Northwest (top-left)
        newWidth = Math.max(20, element.width - deltaX);
        newHeight = Math.max(20, element.height - deltaY);
        newX = element.x + deltaX;
        newY = element.y + deltaY;
        break;
      case 'ne': // Northeast (top-right)
        newWidth = Math.max(20, element.width + deltaX);
        newHeight = Math.max(20, element.height - deltaY);
        newY = element.y + deltaY;
        break;
      case 'sw': // Southwest (bottom-left)
        newWidth = Math.max(20, element.width - deltaX);
        newHeight = Math.max(20, element.height + deltaY);
        newX = element.x + deltaX;
        break;
      default:
        break;
    }
    
    // Apply grid snapping if enabled
    if (gridSnapEnabled) {
      newWidth = snapToGrid(newWidth);
      newHeight = snapToGrid(newHeight);
      newX = snapToGrid(newX);
      newY = snapToGrid(newY);
    }
    
    // Update element dimensions
    setElements(prevElements => 
      prevElements.map(item => 
        item.id === element.id ? { ...item, width: newWidth, height: newHeight, x: newX, y: newY } : item
      )
    );
    
    // Update drag offset for next resize calculation
    setDragOffset({
      x: e.clientX,
      y: e.clientY
    });
  }, [isResizing, resizeDirection, gridSnapEnabled, gridSize, zoomLevel]);
  
  // Handle resize end
  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    setResizeDirection(null);
    document.body.classList.remove('resizing');
  }, []);

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
  
  // Add global mouse event listeners for dragging and resizing
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isDraggingElement) {
        const element = elements.find(el => el.id === isDraggingElement);
        if (element) {
          handleElementDrag(e, element);
        }
      } else if (isResizing) {
        const element = elements.find(el => el.id === selectedElement);
        if (element) {
          handleResize(e, element);
        }
      } else if (isCanvasPanning) {
        handleCanvasPan(e);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDraggingElement) {
        handleMouseUp();
      }
      if (isResizing) {
        handleResizeEnd();
      }
      if (isCanvasPanning) {
        endCanvasPan();
      }
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDraggingElement, isResizing, isCanvasPanning, elements, handleElementDrag, handleMouseUp, selectedElement, handleResize, handleResizeEnd, handleCanvasPan, endCanvasPan]);
  
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
      
      // Account for zoom level and offset when calculating drop position
      let x = (e.clientX - canvasRect.left) / zoomLevel - canvasOffset.x;
      let y = (e.clientY - canvasRect.top) / zoomLevel - canvasOffset.y;
      
      // Apply grid snapping if enabled
      if (gridSnapEnabled) {
        x = snapToGrid(x);
        y = snapToGrid(y);
      }
      
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
  
  // Update element properties
  const updateElement = (updatedElement) => {
    setElements(elements.map(el => 
      el.id === updatedElement.id ? updatedElement : el
    ));
  };
  
  // Clipboard state for copy-paste operations
  const [copiedElement, setCopiedElement] = useState(null);
  
  // Copy selected element
  const copyElement = () => {
    if (selectedElement) {
      const elementToCopy = elements.find(el => el.id === selectedElement);
      if (elementToCopy) {
        setCopiedElement(elementToCopy);
      }
    }
  };
  
  // Paste copied element
  const pasteElement = () => {
    if (copiedElement) {
      // Create a new element with a new ID and slightly offset position
      const newElement = {
        ...copiedElement,
        id: Date.now().toString(),
        x: Math.min(copiedElement.x + 20, 595 - copiedElement.width),
        y: Math.min(copiedElement.y + 20, 842 - copiedElement.height)
      };
      
      setElements([...elements, newElement]);
      setSelectedElement(newElement.id);
    }
  };
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Skip if we're inside an input field or text area
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      // Copy: Ctrl+C
      if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        copyElement();
      }
      
      // Paste: Ctrl+V
      if (e.ctrlKey && e.key === 'v') {
        e.preventDefault();
        pasteElement();
      }
      
      // Delete: Delete key
      if (e.key === 'Delete' && selectedElement) {
        e.preventDefault();
        deleteElement();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedElement, elements, copiedElement]); // Include dependencies
  
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
            onChange={updateElement}
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
            
            <div className="flex space-x-2 mb-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={copyElement}
                className="flex-1 flex items-center justify-center"
              >
                <Copy size={12} className="mr-1" />
                Copy
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={pasteElement}
                className={`flex-1 flex items-center justify-center ${!copiedElement ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!copiedElement}
              >
                <Clipboard size={12} className="mr-1" />
                Paste
              </Button>
            </div>
          </>
        )}
      </div>
    );
  };

  // Toggle grid snap
  const toggleGridSnap = () => {
    setGridSnapEnabled(!gridSnapEnabled);
  };

  // Change grid size
  const changeGridSize = (size) => {
    setGridSize(size);
  };

  // Add the Grid component
  const GridOverlay = () => {
    if (!gridSnapEnabled) return null;
    
    const gridLines = [];
    const canvasWidth = 595; // A4 width in px at 72dpi
    const canvasHeight = 842; // A4 height in px at 72dpi
    
    // Create vertical lines
    for (let x = 0; x <= canvasWidth; x += gridSize) {
      gridLines.push(
        <line 
          key={`v-${x}`} 
          x1={x} 
          y1={0} 
          x2={x} 
          y2={canvasHeight} 
          stroke="#ddd" 
          strokeWidth="1" 
          strokeDasharray="2,2"
        />
      );
    }
    
    // Create horizontal lines
    for (let y = 0; y <= canvasHeight; y += gridSize) {
      gridLines.push(
        <line 
          key={`h-${y}`} 
          x1={0} 
          y1={y} 
          x2={canvasWidth} 
          y2={y} 
          stroke="#ddd" 
          strokeWidth="1" 
          strokeDasharray="2,2"
        />
      );
    }
    
    return (
      <svg className="absolute inset-0 pointer-events-none z-0" width={canvasWidth} height={canvasHeight}>
        {gridLines}
      </svg>
    );
  };

  // Handle canvas pan and zoom instructions
  const ZoomControlsPanel = () => {
    return (
      <div className="fixed bottom-4 right-4 bg-white bg-opacity-90 p-2 rounded shadow-md flex flex-col z-50">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-700">Zoom: {Math.round(zoomLevel * 100)}%</span>
          <div className="flex space-x-1 ml-3">
            <button
              className="h-6 w-6 rounded bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200"
              onClick={() => setZoomLevel(prev => Math.max(0.25, prev - 0.1))}
              title="Zoom Out"
            >
              <span className="text-sm">−</span>
            </button>
            <button
              className="h-6 w-6 rounded bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200"
              onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.1))}
              title="Zoom In"
            >
              <span className="text-sm">+</span>
            </button>
            <button
              className="h-6 px-1 rounded bg-gray-100 text-gray-600 flex items-center justify-center text-xs hover:bg-gray-200"
              onClick={resetZoom}
              title="Reset Zoom"
            >
              100%
            </button>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          <div>Hold <span className="font-bold">Shift + Scroll</span> to zoom</div>
          <div>Click and drag to pan the canvas</div>
        </div>
      </div>
    );
  };

  // Grid snap controls panel
  const GridControlsPanel = () => {
    return (
      <div className="absolute left-64 bottom-4 bg-white border border-gray-200 p-2 rounded-r shadow-md flex flex-col z-40">
        <div className="flex items-center justify-between mb-1">
          <button
            className={`flex items-center justify-center px-2 py-1 rounded ${gridSnapEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
            onClick={toggleGridSnap}
            title="Toggle Grid Snap"
          >
            <Grid size={14} className="mr-1" />
            <span className="text-xs font-medium">Grid Snap: {gridSnapEnabled ? 'On' : 'Off'}</span>
          </button>
        </div>
        
        {gridSnapEnabled && (
          <div className="mt-2">
            <label className="block text-xs text-gray-500 mb-1">Grid Size</label>
            <div className="flex items-center">
              <select
                className="text-xs border rounded p-1 w-full"
                value={gridSize}
                onChange={(e) => changeGridSize(parseInt(e.target.value))}
                title="Grid Size"
              >
                <option value="5">5px</option>
                <option value="10">10px</option>
                <option value="20">20px</option>
                <option value="25">25px</option>
                <option value="50">50px</option>
              </select>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 relative">
      {/* Top navbar - Only show in edit mode */}
      {!showPreview && (
        <div className="bg-white border-b border-gray-200 p-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="text-xl font-semibold">Document Builder</div>
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
      
      <div className="flex flex-1 overflow-hidden relative">
        {showPreview ? (
          <PreviewMode 
            elements={elements}
            orderData={orderData}
            onExitPreview={togglePreview}
            onExportPDF={handleExportPDF}
          />
        ) : (
          <>
            {/* Left sidebar with combined element properties */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
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
              
              {/* Element properties panel (when an element is selected) */}
              {selectedElement ? (
                <div className="flex-1 flex flex-col">
                  <div className="p-3 border-b border-gray-200 font-medium flex justify-between items-center">
                    <span>Element Properties</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedElement(null)}
                      className="h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </div>
                  <ElementPropertiesPanel />
                </div>
              ) : (
                /* Element categories and content */
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
              )}
            </div>
            
            {/* Position the grid controls next to the sidebar */}
            {!showPreview && <GridControlsPanel />}
            
            {/* Main canvas area */}
            <div 
              ref={canvasContainerRef}
              className="flex-1 bg-gray-100 overflow-auto flex items-center justify-center p-6 relative"
            >
              <div 
                ref={canvasRef}
                id="invoice-canvas"
                className="bg-white shadow-xl w-[595px] h-[842px] relative"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: '0 0',
                  transition: 'transform 0.05s ease-out',
                  cursor: isCanvasPanning ? 'grabbing' : 'grab',
                  position: 'relative',
                  top: `${canvasOffset.y}px`,
                  left: `${canvasOffset.x}px`,
                }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={(e) => {
                  if (e.target === canvasRef.current || 
                      e.target.tagName === 'svg' || 
                      e.target.tagName === 'line') {
                    setSelectedElement(null);
                  }
                }}
                onMouseDown={startCanvasPan}
              >
                {/* Grid overlay */}
                <GridOverlay />
                
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
                        cursor: isResizing ? 'auto' : 'move',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedElement(element.id);
                      }}
                      onMouseDown={(e) => !isResizing && handleMouseDown(e, element)}
                      onMouseMove={(e) => isSelected && !isResizing && handleElementDrag(e, element)}
                      onMouseUp={handleMouseUp}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        const touch = e.touches[0];
                        const rect = e.currentTarget.getBoundingClientRect();
                        setSelectedElement(element.id);
                        setIsDraggingElement(element.id);
                        setDragOffset({
                          x: touch.clientX - rect.left,
                          y: touch.clientY - rect.top
                        });
                        document.body.classList.add('dragging');
                      }}
                      onTouchMove={(e) => {
                        if (isDraggingElement === element.id) {
                          const touch = e.touches[0];
                          const mockEvent = { 
                            clientX: touch.clientX, 
                            clientY: touch.clientY, 
                            buttons: 1 
                          };
                          handleElementDrag(mockEvent, element);
                        }
                      }}
                      onTouchEnd={() => handleMouseUp()}
                    >
                      {renderElementContent(element, isSelected)}
                      
                      {isSelected && (
                        <>
                          <div className="absolute -top-5 left-0 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded flex items-center">
                            <Move size={12} className="mr-1" />
                            <span>{element.type}</span>
                          </div>
                          
                          {/* Resize handles */}
                          <div 
                            className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full border border-white cursor-ne-resize -translate-x-1/2 translate-y-1/2" 
                            onMouseDown={(e) => handleResizeStart(e, element, 'ne')}
                          />
                          <div 
                            className="absolute top-0 left-0 w-3 h-3 bg-blue-500 rounded-full border border-white cursor-nw-resize translate-x-1/2 translate-y-1/2" 
                            onMouseDown={(e) => handleResizeStart(e, element, 'nw')}
                          />
                          <div 
                            className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 rounded-full border border-white cursor-se-resize -translate-x-1/2 -translate-y-1/2" 
                            onMouseDown={(e) => handleResizeStart(e, element, 'se')}
                          />
                          <div 
                            className="absolute bottom-0 left-0 w-3 h-3 bg-blue-500 rounded-full border border-white cursor-sw-resize translate-x-1/2 -translate-y-1/2" 
                            onMouseDown={(e) => handleResizeStart(e, element, 'sw')}
                          />
                          <div 
                            className="absolute top-0 left-1/2 w-3 h-3 bg-blue-500 rounded-full border border-white cursor-n-resize -translate-x-1/2 translate-y-1/2" 
                            onMouseDown={(e) => handleResizeStart(e, element, 'n')}
                          />
                          <div 
                            className="absolute bottom-0 left-1/2 w-3 h-3 bg-blue-500 rounded-full border border-white cursor-s-resize -translate-x-1/2 -translate-y-1/2" 
                            onMouseDown={(e) => handleResizeStart(e, element, 's')}
                          />
                          <div 
                            className="absolute left-0 top-1/2 w-3 h-3 bg-blue-500 rounded-full border border-white cursor-w-resize translate-x-1/2 -translate-y-1/2" 
                            onMouseDown={(e) => handleResizeStart(e, element, 'w')}
                          />
                          <div 
                            className="absolute right-0 top-1/2 w-3 h-3 bg-blue-500 rounded-full border border-white cursor-e-resize -translate-x-1/2 -translate-y-1/2" 
                            onMouseDown={(e) => handleResizeStart(e, element, 'e')}
                          />
                        </>
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
          </>
        )}
      </div>
      
      {/* Only keep zoom controls panel at the bottom level */}
      {!showPreview && (
        <ZoomControlsPanel />
      )}
    </div>
  );
};

export default ModernInvoiceBuilderComplete;