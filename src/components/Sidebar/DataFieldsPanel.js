import React from 'react';
import { Database } from 'lucide-react';

const DataFieldsPanel = ({ orderData, addDataField }) => {
  // Available data fields based on order structure
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
    <div className="mb-6">
      <h3 className="font-medium mb-2">Data Fields</h3>
      <div className="space-y-2">
        {availableDataFields.map((field, index) => (
          <button
            key={index}
            className="flex items-center space-x-2 p-2 w-full rounded bg-blue-50 hover:bg-blue-100 transition"
            onClick={() => addDataField(field)}
          >
            <Database size={16} />
            <span>{field.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DataFieldsPanel;