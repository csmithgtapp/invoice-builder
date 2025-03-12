import React from 'react';
import OrderDataPanel from './OrderDataPanel';
import TemplatesPanel from './TemplatesPanel';
import ElementsPanel from './ElementsPanel';
import DataFieldsPanel from './DataFieldsPanel';
import ElementPropertiesPanel from './ElementPropertiesPanel';

const Sidebar = ({
  orderData,
  orderId,
  setOrderId,
  handleFetchOrder,
  showPlaceholders,
  setShowPlaceholders,
  templates,
  selectedTemplate,
  handleLoadTemplate,
  elements,
  setElements,
  selectedElement,
  setSelectedElement
}) => {
  return (
    <div className="w-64 bg-white p-4 shadow-md overflow-y-auto">
      <OrderDataPanel
        orderData={orderData}
        orderId={orderId}
        setOrderId={setOrderId}
        handleFetchOrder={handleFetchOrder}
        showPlaceholders={showPlaceholders}
        setShowPlaceholders={setShowPlaceholders}
      />
      
      <TemplatesPanel
        templates={templates}
        selectedTemplate={selectedTemplate}
        handleLoadTemplate={handleLoadTemplate}
      />
      
      <ElementsPanel
        addElement={(type) => {
          const newElement = createElementOfType(type);
          setElements([...elements, newElement]);
          setSelectedElement(newElement.id);
        }}
      />
      
      {orderData && (
        <DataFieldsPanel
          orderData={orderData}
          addDataField={(dataField) => {
            const newElement = createDataFieldElement(dataField);
            setElements([...elements, newElement]);
            setSelectedElement(newElement.id);
          }}
        />
      )}
      
      {selectedElement && (
        <ElementPropertiesPanel
          element={elements.find(el => el.id === selectedElement)}
          updateElement={(updatedElement) => {
            setElements(elements.map(el => 
              el.id === selectedElement ? updatedElement : el
            ));
          }}
          deleteElement={() => {
            setElements(elements.filter(el => el.id !== selectedElement));
            setSelectedElement(null);
          }}
          bringToFront={() => {
            const highestZ = Math.max(...elements.map(el => el.zIndex), 0);
            setElements(elements.map(el => 
              el.id === selectedElement 
                ? { ...el, zIndex: highestZ + 1 }
                : el
            ));
          }}
          sendToBack={() => {
            const lowestZ = Math.min(...elements.map(el => el.zIndex), 0);
            setElements(elements.map(el => 
              el.id === selectedElement 
                ? { ...el, zIndex: lowestZ - 1 }
                : el
            ));
          }}
          orderData={orderData}
        />
      )}
    </div>
  );
};

// Helper functions to create elements
const createElementOfType = (type) => {
  return {
    id: Date.now().toString(),
    type,
    x: 100,
    y: 100,
    width: getDefaultWidth(type),
    height: getDefaultHeight(type),
    content: getDefaultContent(type),
    zIndex: 1,
    style: getDefaultStyle(type),
  };
};

const createDataFieldElement = (dataField) => {
  return {
    id: Date.now().toString(),
    type: 'dataField',
    dataField: dataField.path,
    x: 100,
    y: 100,
    width: 200,
    height: 30,
    content: `{${dataField.path}}`,
    displayName: dataField.label,
    zIndex: 1,
    style: {},
  };
};

// Default properties helpers
const getDefaultWidth = (type) => {
  switch(type) {
    case 'heading': return 350;
    case 'text': return 300;
    case 'image': return 200;
    case 'rectangle': return 150;
    case 'list': return 250;
    case 'table': return 500;
    case 'dataField': return 200;
    default: return 200;
  }
};

const getDefaultHeight = (type) => {
  switch(type) {
    case 'heading': return 60;
    case 'text': return 100;
    case 'image': return 150;
    case 'rectangle': return 100;
    case 'list': return 150;
    case 'table': return 200;
    case 'dataField': return 30;
    default: return 100;
  }
};

const getDefaultContent = (type) => {
  switch(type) {
    case 'heading': return 'Document Heading';
    case 'text': return 'Edit this text block with your content. You can resize and position it as needed.';
    case 'list': return ['Item 1', 'Item 2', 'Item 3'];
    case 'table': return 'items';
    case 'dataField': return '{dataField}';
    default: return null;
  }
};

const getDefaultStyle = (type) => {
  switch(type) {
    case 'heading': return { fontWeight: 'bold', fontSize: '24px' };
    case 'text': return { fontSize: '16px' };
    case 'rectangle': return { backgroundColor: '#e2e8f0', border: '1px solid #cbd5e0' };
    default: return {};
  }
};

export default Sidebar;