import React from 'react';
import { Plus, Trash } from 'lucide-react';

const ListElement = ({ element, onChange, isSelected }) => {
  // Ensure content is always an array
  const getListItems = () => {
    if (!element.content) {
      return ['Item 1'];
    }
    
    if (Array.isArray(element.content)) {
      return element.content;
    }
    
    // If it's a string, try to parse as JSON, or split by newlines
    if (typeof element.content === 'string') {
      try {
        const parsed = JSON.parse(element.content);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        // Not valid JSON, try splitting by newlines
        if (element.content.includes('\\n')) {
          return element.content.split('\\n');
        }
        return element.content.split('\n');
      }
    }
    
    return ['Item 1'];
  };
  
  const items = getListItems();

  const handleItemChange = (value, index) => {
    const newItems = [...items];
    newItems[index] = value;
    onChange({ ...element, content: newItems });
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      onChange({ ...element, content: newItems });
    }
  };

  const handleAddItem = () => {
    onChange({ 
      ...element, 
      content: [...items, `Item ${items.length + 1}`] 
    });
  };

  // In view mode (not selected), just display the list
  if (!isSelected) {
    return (
      <div 
        className="w-full h-full p-2 overflow-auto"
        style={element.style}
      >
        <ul className="list-disc pl-4">
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    );
  }

  // In edit mode (selected), allow editing of list items
  return (
    <div className="w-full h-full p-2 overflow-auto">
      {items.map((item, index) => (
        <div key={index} className="flex items-center mb-2">
          <span className="mr-2">•</span>
          <input
            type="text"
            className="flex-1 border-b border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent px-1"
            value={item}
            onChange={(e) => handleItemChange(e.target.value, index)}
            onClick={(e) => e.stopPropagation()}
            style={{
              fontSize: element.style?.fontSize || 'inherit',
              fontWeight: element.style?.fontWeight || 'inherit',
              color: element.style?.color || 'inherit'
            }}
          />
          <button
            className="ml-2 text-red-500 hover:text-red-700"
            onClick={() => handleRemoveItem(index)}
          >
            <Trash size={14} />
          </button>
        </div>
      ))}
      
      <button
        className="mt-2 text-blue-500 hover:text-blue-700 text-sm flex items-center"
        onClick={handleAddItem}
      >
        <Plus size={14} className="mr-1" />
        Add item
      </button>
    </div>
  );
};

export default ListElement;