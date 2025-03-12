// src/components/Sidebar/DataFieldsPanel.js
import React, { useState } from 'react';
import { Database, Search, ChevronRight, ChevronDown } from 'lucide-react';

const DataFieldsPanel = ({ orderData, addDataField }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({
    'order': true,
    'customer': true,
    'items': true,
    'shipping': true,
    'payment': true
  });

  // Toggle a group's expanded state
  const toggleGroup = (group) => {
    setExpandedGroups({
      ...expandedGroups,
      [group]: !expandedGroups[group]
    });
  };

  // Available data fields organized by groups
  const dataFieldGroups = {
    'order': [
      { label: 'Order Number', path: 'id' },
      { label: 'Order Date', path: 'orderDate' },
      { label: 'Status', path: 'status' }
    ],
    'customer': [
      { label: 'Customer Name', path: 'customerName' },
      { label: 'Customer Address', path: 'customerAddress' },
    ],
    'shipping': [
      { label: 'Ship To', path: 'shipTo' },
      { label: 'Ship Date', path: 'shipDate' },
      { label: 'Ship Via', path: 'shipVia' },
      { label: 'Weight', path: 'weight' },
      { label: 'Origin Country', path: 'origin' }
    ],
    'payment': [
      { label: 'Subtotal', path: 'subtotal' },
      { label: 'Tax', path: 'tax' },
      { label: 'Shipping Cost', path: 'shipping' },
      { label: 'Total', path: 'total' },
      { label: 'Currency', path: 'currency' },
      { label: 'Terms', path: 'terms' }
    ],
    'items': [
      { label: 'Line Items Table', path: 'items' }
    ]
  };

  // Filter fields based on search term
  const getFilteredFields = () => {
    if (!searchTerm) {
      return dataFieldGroups;
    }

    const filtered = {};
    
    Object.keys(dataFieldGroups).forEach(group => {
      const matchingFields = dataFieldGroups[group].filter(field => 
        field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        field.path.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (matchingFields.length > 0) {
        filtered[group] = matchingFields;
      }
    });
    
    return filtered;
  };

  // Check if a field exists in orderData
  const fieldExists = (path) => {
    if (!orderData) return false;
    
    const getValue = (obj, path) => {
      return path.split('.').reduce((prev, current) => {
        return prev && prev[current] !== undefined ? prev[current] : undefined;
      }, obj);
    };
    
    return getValue(orderData, path) !== undefined;
  };

  const filteredGroups = getFilteredFields();
  
  // Handle drag start
  const handleDragStart = (e, field) => {
    e.dataTransfer.setData('element-type', 'dataField');
    e.dataTransfer.setData('data-field', field.path);
    e.dataTransfer.setData('data-label', field.label);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="mb-6">
      <h3 className="font-medium mb-2">Data Fields</h3>
      
      <div className="relative mb-3">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={14} className="text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Search fields..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
        {Object.keys(filteredGroups).map(group => (
          <div key={group} className="border border-gray-200 rounded overflow-hidden">
            <div 
              className="flex items-center justify-between bg-gray-50 px-3 py-2 cursor-pointer"
              onClick={() => toggleGroup(group)}
            >
              <span className="font-medium text-sm capitalize">{group}</span>
              {expandedGroups[group] ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </div>
            
            {expandedGroups[group] && (
              <div className="p-1">
                {filteredGroups[group].map((field, index) => {
                  const exists = fieldExists(field.path);
                  
                  return (
                    <div
                      key={index}
                      className={`flex items-center space-x-2 p-2 mb-1 rounded text-sm ${
                        exists 
                          ? 'bg-blue-50 hover:bg-blue-100 cursor-grab' 
                          : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                      draggable={exists}
                      onDragStart={(e) => exists && handleDragStart(e, field)}
                      onClick={() => exists && addDataField(field)}
                    >
                      <Database size={14} className={exists ? 'text-blue-500' : 'text-gray-400'} />
                      <span>{field.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <p className="mt-2 text-xs text-gray-500">
        {orderData ? (
          "Drag fields onto the canvas or click to add"
        ) : (
          "Fetch order data to enable these fields"
        )}
      </p>
    </div>
  );
};

export default DataFieldsPanel;