import React, { useState, useEffect } from 'react';
import OrderService from '../services/OrderService';
import Sidebar from './Sidebar/Sidebar';
import Canvas from './Canvas/Canvas';
import { Save, Download, FileText } from 'lucide-react';

const InvoiceBuilder = () => {
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [orderId, setOrderId] = useState('');
  const [showPlaceholders, setShowPlaceholders] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const orderService = new OrderService();

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
    // PDF generation logic (import from PDFGenerator service)
    alert("PDF generation would happen here");
  };

  // Generate JSON
  const generateJSON = () => {
    if (!orderData) {
      alert('Please fetch order data first');
      return;
    }
    
    // JSON generation logic
    console.log('JSON Output:', elements);
    alert('JSON output generated! Check the console.');
  };

  return (
    <div className="flex flex-col w-full h-screen max-h-screen bg-gray-100">
      <div className="p-4 bg-white shadow-md flex justify-between items-center">
        <h2 className="text-xl font-bold">Commercial Invoice Builder</h2>
        <div className="flex space-x-2">
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
      </div>
    </div>
  );
};

export default InvoiceBuilder;