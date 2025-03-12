import React from 'react';
import { ArrowDownUp, Trash2 } from 'lucide-react';

const ElementPropertiesPanel = ({ 
  element, 
  updateElement, 
  deleteElement, 
  bringToFront, 
  sendToBack,
  orderData 
}) => {
  if (!element) return null;

  // Handle data field content change
  const handleDataFieldChange = (e) => {
    updateElement({ ...element, content: e.target.value });
  };

  // Handle data field selection change
  const handleDataFieldSelect = (e) => {
    const dataField = e.target.value;
    updateElement({ 
      ...element, 
      dataField, 
      content: `{${dataField}}` 
    });
  };

  // Available data fields for selection
  const availableDataFields = [
    { label: 'Order Number', path: 'id' },
    { label: 'Customer Name', path: 'customerName' },
    { label: 'Customer Address', path: 'customerAddress' },
    { label: 'Order Date', path: 'orderDate' },
    { label: 'Subtotal', path: 'subtotal' },
    { label: 'Tax', path: 'tax' },
    { label: 'Total', path: 'total' },
    { label: 'Status', path: 'status' }
  ];

  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="font-medium mb-4">Element Actions</h3>
      
      {/* Data field specific controls */}
      {element.type === 'dataField' && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Data Field</label>
          <select
            className="w-full p-2 border rounded mb-2"
            value={element.dataField || ''}
            onChange={handleDataFieldSelect}
          >
            <option value="">Select a field</option>
            {availableDataFields.map((field, index) => (
              <option key={index} value={field.path}>{field.label}</option>
            ))}
          </select>
          
          <label className="block text-sm font-medium mb-1">Display Format</label>
          <input
            type="text"
            className="w-full p-2 border rounded mb-2"
            value={element.content || ''}
            onChange={handleDataFieldChange}
            placeholder="Format: {fieldName}"
          />
          <p className="text-xs text-gray-500">
            Use {'{fieldName}'} as placeholder for the actual value
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-2">
        <button
          className="flex items-center justify-center p-2 bg-gray-100 hover:bg-gray-200 rounded"
          onClick={bringToFront}
        >
          <ArrowDownUp size={16} className="mr-1" />
          Bring Front
        </button>
        <button
          className="flex items-center justify-center p-2 bg-gray-100 hover:bg-gray-200 rounded"
          onClick={sendToBack}
        >
          <ArrowDownUp size={16} className="mr-1 transform rotate-180" />
          Send Back
        </button>
        <button
          className="flex items-center justify-center p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded col-span-2"
          onClick={deleteElement}
        >
          <Trash2 size={16} className="mr-1" />
          Delete
        </button>
      </div>
    </div>
  );
};

export default ElementPropertiesPanel;