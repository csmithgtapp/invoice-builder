import React from 'react';
import { Text, Move, Image, Square, Heading, List, FileText } from 'lucide-react';

const ElementsPanel = ({ addElement }) => {
  // Available elements that can be added to the canvas
  const availableElements = [
    { type: 'heading', label: 'Heading', icon: <Heading size={24} /> },
    { type: 'text', label: 'Text Block', icon: <Text size={24} /> },
    { type: 'image', label: 'Image', icon: <Image size={24} /> },
    { type: 'rectangle', label: 'Rectangle', icon: <Square size={24} /> },
    { type: 'list', label: 'List', icon: <List size={24} /> },
    { type: 'table', label: 'Data Table', icon: <FileText size={24} /> }
  ];

  return (
    <div className="mb-6">
      <h3 className="font-medium mb-2">Elements</h3>
      <div className="space-y-2">
        {availableElements.map((element, index) => (
          <button
            key={index}
            className="flex items-center space-x-2 p-2 w-full rounded bg-gray-100 hover:bg-gray-200 transition"
            onClick={() => addElement(element.type)}
          >
            <span>{element.icon}</span>
            <span>{element.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ElementsPanel;