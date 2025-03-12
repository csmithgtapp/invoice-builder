import React from 'react';

const ListElement = ({ items, onChange }) => {
  const handleItemChange = (value, index) => {
    const newItems = [...items];
    newItems[index] = value;
    onChange(newItems);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      onChange(newItems);
    }
  };

  const handleAddItem = () => {
    onChange([...items, `Item ${items.length + 1}`]);
  };

  return (
    <div className="w-full h-full p-2 overflow-auto">
      {items.map((item, index) => (
        <div key={index} className="flex items-center mb-2">
          <span className="mr-2">•</span>
          <input
            type="text"
            className="flex-1 border-b border-gray-300 focus:outline-none focus:border-blue-500"
            value={item}
            onChange={(e) => handleItemChange(e.target.value, index)}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="ml-2 text-red-500 hover:text-red-700"
            onClick={() => handleRemoveItem(index)}
          >
            ×
          </button>
        </div>
      ))}
      <button
        className="mt-2 text-blue-500 hover:text-blue-700 text-sm"
        onClick={handleAddItem}
      >
        + Add item
      </button>
    </div>
  );
};

export default ListElement;