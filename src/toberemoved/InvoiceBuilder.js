// src/components/InvoiceBuilder.js
import React, { useState, useEffect } from 'react';
import OrderService from '../services/OrderService';
import PDFGenerator from '../services/PDFGenerator';
import Sidebar from './Sidebar';
import Canvas from './Canvas';
import { Save, Download, FileText, Eye, EyeOff } from 'lucide-react';

const InvoiceBuilder = () => {
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [orderId, setOrderId] = useState('');
  const [showPlaceholders, setShowPlaceholders] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const orderService = new OrderService();
  const pdfGenerator = new PDFGenerator();

  // Load templates on component mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const templates = await orderService.getTemplates();
        setTemplates(templates);
      } catch (error) {
        console.error("Error loading templates:", error);
      }
    };
    
    loadTemplates();
  }, []);

  // Fetch order data
  const handleFetchOrder = async (id) => {
    if (!id) return;
    
    try {
      const data = await orderService.getOrderById(id);
      setOrderData(data);
    } catch (error) {
      console.error("Error fetching order:", error);
      setOrderData(orderService.getMockOrder(id));
    }
  };

  // Load a template
  const handleLoadTemplate = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setElements(template.elements);
    }
  };

  // Save template
  const saveTemplate = () => {
    const templateName = prompt('Enter a name for this template:');
    if (!templateName) return;
    
    const template = {
      id: `template-${Date.now()}`,
      name: templateName,
      type: 'invoice',
      elements
    };
    
    setTemplates([...templates, template]);
    setSelectedTemplate(template);
    alert(`Template "${templateName}" saved!`);
  };

  // Generate PDF
  const generatePDF = async () => {
    if (!orderData) {
      alert('Please fetch order data first');
      return;
    }

    setShowPreview(true);
    
    // In a real implementation, we would generate a PDF file using the elements and orderData
    try {
      // Helper function to get value from orderData
      const getValueFromPath = (path) => {
        if (!orderData || !path) return null;
        
        return path.split('.').reduce((prev, current) => {
          return prev ? prev[current] : null;
        }, orderData);
      };
      
      await pdfGenerator.generatePDF(elements, orderData, orderData.id, getValueFromPath);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  // Generate JSON
  const generateJSON = () => {
    if (!orderData) {
      alert('Please fetch order data first');
      return;
    }
    
    // Generate JSON output for export
    const output = {
      template: {
        id: selectedTemplate?.id || `template-${Date.now()}`,
        name: selectedTemplate?.name || 'Untitled Template',
        type: 'invoice',
        elements
      },
      orderData
    };
    
    console.log('JSON Output:', output);
    
    // Create a blob and trigger download
    const jsonString = JSON.stringify(output, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice_${orderData.id}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
    
    alert('JSON output generated and downloaded!');
  };
  
  // Toggle preview mode
  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  // Helper function to render preview elements
  const renderPreviewElement = (element, orderData, getValueFromPath) => {
    switch(element.type) {
      case 'heading':
      case 'text':
        return (
          <div 
            className="w-full h-full overflow-hidden p-1" 
            style={element.style}
          >
            {element.content}
          </div>
        );
      case 'rectangle':
        return <div className="w-full h-full" style={element.style} />;
      case 'image':
        return (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <img src="/placeholder.png" alt="placeholder" className="max-w-full max-h-full" />
          </div>
        );
      case 'dataField':
        let content = element.content;
        
        if (orderData && element.dataField) {
          // Replace template variables with actual data
          const value = getValueFromPath(element.dataField);
          if (value !== null && value !== undefined) {
            content = content.replace(
              new RegExp(`\\{${element.dataField}\\}`, 'g'), 
              value
            );
          }
        }
        
        return (
          <div 
            className="w-full h-full overflow-hidden p-1" 
            style={element.style}
          >
            {content}
          </div>
        );
      case 'table':
        if (element.dataField && orderData) {
          const tableData = getValueFromPath(element.dataField);
          
          if (Array.isArray(tableData)) {
            return (
              <div className="w-full h-full overflow-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-1 text-left">Item</th>
                      <th className="border p-1 text-center">Qty</th>
                      <th className="border p-1 text-right">Price</th>
                      <th className="border p-1 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border p-1">{item.name}</td>
                        <td className="border p-1 text-center">{item.quantity}</td>
                        <td className="border p-1 text-right">${item.unitPrice?.toFixed(2)}</td>
                        <td className="border p-1 text-right">${item.total?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
        }
        
        return (
          <div className="w-full h-full p-2 flex items-center justify-center bg-gray-50 border border-gray-200">
            <p className="text-gray-500 text-sm">Table data will appear here</p>
          </div>
        );
      case 'list':
        return (
          <div className="w-full h-full p-2 overflow-auto">
            <ul className="list-disc pl-5">
              {Array.isArray(element.content) && element.content.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col w-full h-screen max-h-screen bg-gray-100">
      <div className="p-4 bg-white shadow-md flex justify-between items-center">
        <h2 className="text-xl font-bold">Commercial Invoice Builder</h2>
        <div className="flex space-x-2">
          <button
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition flex items-center"
            onClick={togglePreview}
          >
            {showPreview ? (
              <>
                <EyeOff size={16} className="mr-2" />
                Exit Preview
              </>
            ) : (
              <>
                <Eye size={16} className="mr-2" />
                Preview
              </>
            )}
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition flex items-center"
            onClick={saveTemplate}
          >
            <Save size={16} className="mr-2" />
            Save Template
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition flex items-center"
            onClick={generatePDF}
            disabled={!orderData}
          >
            <Download size={16} className="mr-2" />
            Generate PDF
          </button>
          <button
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition flex items-center"
            onClick={generateJSON}
            disabled={!orderData}
          >
            <FileText size={16} className="mr-2" />
            Generate JSON
          </button>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {!showPreview ? (
          <>
            <Sidebar 
              orderData={orderData}
              orderId={orderId}
              setOrderId={setOrderId}
              handleFetchOrder={handleFetchOrder}
              showPlaceholders={showPlaceholders}
              setShowPlaceholders={setShowPlaceholders}
              templates={templates}
              selectedTemplate={selectedTemplate}
              handleLoadTemplate={handleLoadTemplate}
              elements={elements}
              setElements={setElements}
              selectedElement={selectedElement}
              setSelectedElement={setSelectedElement}
            />
            
            <Canvas 
              elements={elements}
              setElements={setElements}
              selectedElement={selectedElement}
              setSelectedElement={setSelectedElement}
              orderData={orderData}
              showPlaceholders={showPlaceholders}
            />
          </>
        ) : (
          <div className="flex-1 bg-gray-800 p-8 flex items-center justify-center">
            <div className="bg-white shadow-2xl mx-auto">
              <div className="relative w-[600px] h-[842px]">
                {elements.map(element => {
                  // Helper function to get value from orderData
                  const getValueFromPath = (path) => {
                    if (!orderData || !path) return null;
                    
                    return path.split('.').reduce((prev, current) => {
                      return prev ? prev[current] : null;
                    }, orderData);
                  };
                  
                  return (
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
                      {renderPreviewElement(element, orderData, getValueFromPath)}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceBuilder;