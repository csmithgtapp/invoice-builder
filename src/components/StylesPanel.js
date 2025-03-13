import React, { useState, useEffect } from 'react';
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, Plus, Minus } from 'lucide-react';

// A simplified StylesPanel component that works with the parent component
const StylesPanel = ({ element, updateElement, onClose }) => {
  // Create local state variables to track UI values
  const [localStyles, setLocalStyles] = useState({
    fontSize: 14,
    fontWeight: 'normal',
    fontStyle: 'normal',
    textAlign: 'left',
    color: '#000000',
    backgroundColor: '#ffffff',
    padding: 0,
    borderWidth: 0,
    borderColor: '#000000',
    borderStyle: 'none',
    borderRadius: 0
  });
  
  // Initialize local styles from element when component mounts or element changes
  useEffect(() => {
    if (!element?.style) return;
    
    setLocalStyles({
      fontSize: parseInt(element.style.fontSize) || 14,
      fontWeight: element.style.fontWeight || 'normal',
      fontStyle: element.style.fontStyle || 'normal',
      textAlign: element.style.textAlign || 'left',
      color: element.style.color || '#000000',
      backgroundColor: element.style.backgroundColor || '#ffffff',
      padding: parseInt(element.style.padding) || 0,
      borderWidth: parseInt(element.style.borderWidth) || 0,
      borderColor: element.style.borderColor || '#000000',
      borderStyle: element.style.borderStyle || 'none',
      borderRadius: parseInt(element.style.borderRadius) || 0
    });
  }, [element]);

  // For smoother control interaction, we'll use two functions:
  // 1. This one updates local state without updating the element
  const handleLocalChange = (changes) => {
    setLocalStyles(prevStyles => ({ ...prevStyles, ...changes }));
  };
  
  // 2. This one applies changes to the actual element
  const applyStyleChanges = (changes) => {
    // First update local state
    const newStyles = { ...localStyles, ...changes };
    setLocalStyles(newStyles);
    
    // Only update the element if we have a valid element
    if (!element) return;
    
    // Prepare styles in the format expected by the element
    const styleUpdates = {
      fontSize: `${newStyles.fontSize}px`,
      fontWeight: newStyles.fontWeight,
      fontStyle: newStyles.fontStyle,
      textAlign: newStyles.textAlign,
      color: newStyles.color,
      backgroundColor: newStyles.backgroundColor,
      padding: `${newStyles.padding}px`,
      borderWidth: `${newStyles.borderWidth}px`,
      borderColor: newStyles.borderColor,
      borderStyle: newStyles.borderWidth > 0 ? (newStyles.borderStyle || 'solid') : 'none',
      borderRadius: `${newStyles.borderRadius}px`,
    };
    
    // Create a new element with updated style
    const updatedElement = {
      ...element,
      style: {
        ...element.style,
        ...styleUpdates
      }
    };
    
    // Update the element in the parent component
    updateElement(updatedElement);
  };

  // Helper function to increment/decrement numeric values
  const adjustValue = (property, amount, min, max) => {
    const currentValue = localStyles[property];
    const newValue = Math.max(min, Math.min(max, currentValue + amount));
    
    if (newValue !== currentValue) {
      const changes = { [property]: newValue };
      
      // For border width, we need to set the border style as well
      if (property === 'borderWidth') {
        changes.borderStyle = newValue > 0 ? 'solid' : 'none';
      }
      
      applyStyleChanges(changes);
    }
  };

  // Handle direct input change
  const handleNumberInputChange = (property, e, min, max) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      const newValue = Math.max(min, Math.min(max, value));
      const changes = { [property]: newValue };
      
      // For border width, we need to set the border style as well
      if (property === 'borderWidth') {
        changes.borderStyle = newValue > 0 ? 'solid' : 'none';
      }
      
      handleLocalChange(changes);
    } else {
      // If the input is not a valid number, keep the current value in the input field
      handleLocalChange({ [property]: e.target.value });
    }
  };

  // Handle input blur - apply changes when focus leaves the input
  const handleInputBlur = (property, min, max) => {
    const value = parseInt(localStyles[property]);
    if (!isNaN(value)) {
      const newValue = Math.max(min, Math.min(max, value));
      const changes = { [property]: newValue };
      
      // For border width, we need to set the border style as well
      if (property === 'borderWidth') {
        changes.borderStyle = newValue > 0 ? 'solid' : 'none';
      }
      
      applyStyleChanges(changes);
    } else {
      // If the value is invalid, reset to the previous valid value
      applyStyleChanges({ [property]: localStyles[property] });
    }
  };

  // If no element is provided, don't render anything
  if (!element) return null;

  return (
    <div className="border-0 shadow-none">
      <div className="px-3 py-2 border-b flex flex-row items-center justify-between">
        <h3 className="text-sm font-medium">Style Editor</h3>
        <button 
          className="text-gray-500 hover:text-gray-700" 
          onClick={onClose}
          type="button"
        >
          ×
        </button>
      </div>
      
      <div className="p-3 space-y-4 overflow-y-auto max-h-[80vh]">
        {/* Text Styles */}
        <div className="space-y-2 pb-2 border-b">
          <label className="text-xs font-medium text-gray-500">Font Style</label>
          <div className="flex space-x-1">
            <button 
              className={`w-8 h-8 flex items-center justify-center rounded ${localStyles.fontWeight === 'bold' ? 'bg-blue-500 text-white' : 'border border-gray-300'}`}
              onClick={() => applyStyleChanges({ fontWeight: localStyles.fontWeight === 'bold' ? 'normal' : 'bold' })}
              type="button"
            >
              <Bold size={14} />
            </button>
            <button 
              className={`w-8 h-8 flex items-center justify-center rounded ${localStyles.fontStyle === 'italic' ? 'bg-blue-500 text-white' : 'border border-gray-300'}`}
              onClick={() => applyStyleChanges({ fontStyle: localStyles.fontStyle === 'italic' ? 'normal' : 'italic' })}
              type="button"
            >
              <Italic size={14} />
            </button>
            <button 
              className={`w-8 h-8 flex items-center justify-center rounded ${localStyles.textAlign === 'left' ? 'bg-blue-500 text-white' : 'border border-gray-300'}`}
              onClick={() => applyStyleChanges({ textAlign: 'left' })}
              type="button"
            >
              <AlignLeft size={14} />
            </button>
            <button 
              className={`w-8 h-8 flex items-center justify-center rounded ${localStyles.textAlign === 'center' ? 'bg-blue-500 text-white' : 'border border-gray-300'}`}
              onClick={() => applyStyleChanges({ textAlign: 'center' })}
              type="button"
            >
              <AlignCenter size={14} />
            </button>
            <button 
              className={`w-8 h-8 flex items-center justify-center rounded ${localStyles.textAlign === 'right' ? 'bg-blue-500 text-white' : 'border border-gray-300'}`}
              onClick={() => applyStyleChanges({ textAlign: 'right' })}
              type="button"
            >
              <AlignRight size={14} />
            </button>
          </div>
        </div>
        
        <div className="space-y-2 pb-2 border-b">
          <label className="text-xs font-medium text-gray-500">Font Size</label>
          <div className="flex items-center space-x-2">
            <button 
              className="h-8 w-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
              onClick={() => adjustValue('fontSize', -1, 8, 48)}
              type="button"
            >
              <Minus size={14} />
            </button>
            <input 
              type="text"
              value={localStyles.fontSize}
              onChange={(e) => handleNumberInputChange('fontSize', e, 8, 48)}
              onBlur={() => handleInputBlur('fontSize', 8, 48)}
              className="flex-1 text-center text-xs border rounded p-1.5"
            />
            <button 
              className="h-8 w-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
              onClick={() => adjustValue('fontSize', 1, 8, 48)}
              type="button"
            >
              <Plus size={14} />
            </button>
            <span className="text-xs w-8 text-right">px</span>
          </div>
        </div>
        
        <div className="space-y-2 pb-2 border-b">
          <label className="text-xs font-medium text-gray-500">Text Color</label>
          <div className="flex">
            <input 
              type="color" 
              value={localStyles.color}
              onChange={(e) => handleLocalChange({ color: e.target.value })}
              onBlur={(e) => applyStyleChanges({ color: e.target.value })}
              className="w-8 h-8 p-0 border-0"
            />
            <input 
              type="text" 
              value={localStyles.color}
              onChange={(e) => handleLocalChange({ color: e.target.value })}
              onBlur={(e) => applyStyleChanges({ color: e.target.value })}
              className="w-full ml-2 text-xs border rounded p-1"
            />
          </div>
        </div>
        
        {/* Background Styles */}
        <div className="space-y-2 pb-2 border-b">
          <label className="text-xs font-medium text-gray-500">Background Color</label>
          <div className="flex">
            <input 
              type="color" 
              value={localStyles.backgroundColor}
              onChange={(e) => handleLocalChange({ backgroundColor: e.target.value })}
              onBlur={(e) => applyStyleChanges({ backgroundColor: e.target.value })}
              className="w-8 h-8 p-0 border-0"
            />
            <input 
              type="text" 
              value={localStyles.backgroundColor}
              onChange={(e) => handleLocalChange({ backgroundColor: e.target.value })}
              onBlur={(e) => applyStyleChanges({ backgroundColor: e.target.value })}
              className="w-full ml-2 text-xs border rounded p-1"
            />
          </div>
        </div>
        
        <div className="space-y-2 pb-2 border-b">
          <label className="text-xs font-medium text-gray-500">Padding</label>
          <div className="flex items-center space-x-2">
            <button 
              className="h-8 w-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
              onClick={() => adjustValue('padding', -1, 0, 20)}
              type="button"
            >
              <Minus size={14} />
            </button>
            <input 
              type="text"
              value={localStyles.padding}
              onChange={(e) => handleNumberInputChange('padding', e, 0, 20)}
              onBlur={() => handleInputBlur('padding', 0, 20)}
              className="flex-1 text-center text-xs border rounded p-1.5"
            />
            <button 
              className="h-8 w-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
              onClick={() => adjustValue('padding', 1, 0, 20)}
              type="button"
            >
              <Plus size={14} />
            </button>
            <span className="text-xs w-8 text-right">px</span>
          </div>
        </div>
        
        {/* Border Styles */}
        <div className="space-y-2 pb-2 border-b">
          <label className="text-xs font-medium text-gray-500">Border Width</label>
          <div className="flex items-center space-x-2">
            <button 
              className="h-8 w-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
              onClick={() => adjustValue('borderWidth', -1, 0, 10)}
              type="button"
            >
              <Minus size={14} />
            </button>
            <input 
              type="text"
              value={localStyles.borderWidth}
              onChange={(e) => handleNumberInputChange('borderWidth', e, 0, 10)}
              onBlur={() => handleInputBlur('borderWidth', 0, 10)}
              className="flex-1 text-center text-xs border rounded p-1.5"
            />
            <button 
              className="h-8 w-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
              onClick={() => adjustValue('borderWidth', 1, 0, 10)}
              type="button"
            >
              <Plus size={14} />
            </button>
            <span className="text-xs w-8 text-right">px</span>
          </div>
        </div>
        
        <div className="space-y-2 pb-2 border-b">
          <label className="text-xs font-medium text-gray-500">Border Color</label>
          <div className="flex">
            <input 
              type="color" 
              value={localStyles.borderColor}
              onChange={(e) => handleLocalChange({ borderColor: e.target.value })}
              onBlur={(e) => applyStyleChanges({ borderColor: e.target.value })}
              className="w-8 h-8 p-0 border-0"
            />
            <input 
              type="text" 
              value={localStyles.borderColor}
              onChange={(e) => handleLocalChange({ borderColor: e.target.value })}
              onBlur={(e) => applyStyleChanges({ borderColor: e.target.value })}
              className="w-full ml-2 text-xs border rounded p-1"
            />
          </div>
        </div>
        
        <div className="space-y-2 pb-2 border-b">
          <label className="text-xs font-medium text-gray-500">Border Radius</label>
          <div className="flex items-center space-x-2">
            <button 
              className="h-8 w-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
              onClick={() => adjustValue('borderRadius', -1, 0, 20)}
              type="button"
            >
              <Minus size={14} />
            </button>
            <input 
              type="text"
              value={localStyles.borderRadius}
              onChange={(e) => handleNumberInputChange('borderRadius', e, 0, 20)}
              onBlur={() => handleInputBlur('borderRadius', 0, 20)}
              className="flex-1 text-center text-xs border rounded p-1.5"
            />
            <button 
              className="h-8 w-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
              onClick={() => adjustValue('borderRadius', 1, 0, 20)}
              type="button"
            >
              <Plus size={14} />
            </button>
            <span className="text-xs w-8 text-right">px</span>
          </div>
        </div>

        <div className="pt-2">
          <button 
            className="w-full bg-blue-600 text-white rounded py-1.5 text-sm flex items-center justify-center"
            onClick={onClose}
            type="button"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default StylesPanel;