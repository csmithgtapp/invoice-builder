// src/components/Sidebar/ElementsPanel.js
import React from 'react';
import { Text, Image, Square, Heading, List, FileText, Database } from 'lucide-react';

const ElementsPanel = ({ addElement }) => {
  // Available elements that can be added to the canvas
  const availableElements = [
    { type: 'heading', label: 'Heading', icon: <Heading size={18} /> },
    { type: 'text', label: 'Text Block', icon: <Text size={18} /> },
    { type: 'image', label: 'Image', icon: <Image size={18} /> },
    { type: 'rectangle', label: 'Rectangle', icon: <Square size={18} /> },
    { type: 'list', label: 'List', icon: <List size={18} /> },
    { type: 'table', label: 'Data Table', icon: <FileText size={18} /> },
    { type: 'dataField', label: 'Data Field', icon: <Database size={18} /> }
  ];

  // Handle drag start
  const handleDragStart = (e, elementType) => {
    e.dataTransfer.setData('element-type', elementType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="mb-6">
      <h3 className="font-medium mb-2">Elements</h3>
      <div className="grid grid-cols-2 gap-2">
        {availableElements.map((element, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center p-3 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 cursor-grab transition"
            draggable="true"
            onDragStart={(e) => handleDragStart(e, element.type)}
            onClick={() => addElement(element.type)}
          >
            <div className="mb-1">{element.icon}</div>
            <span className="text-xs text-center">{element.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 text-xs text-gray-500">
        <p>Drag elements to the canvas or click to add</p>
      </div>
    </div>
  );
};

export default ElementsPanel;