import React, { useState } from 'react';
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, ChevronDown } from 'lucide-react';

const StylesPanel = ({ element, updateElement, onClose }) => {
  const [activeTab, setActiveTab] = useState('text');
  
  if (!element) return null;
  
  // Extract current style values with defaults
  const styles = {
    fontSize: element.style?.fontSize ? parseInt(element.style.fontSize) : 14,
    isBold: element.style?.fontWeight === 'bold',
    isItalic: element.style?.fontStyle === 'italic',
    textAlign: element.style?.textAlign || 'left',
    color: element.style?.color || '#000000',
    bgColor: element.style?.backgroundColor || '#ffffff',
    padding: element.style?.padding || '0',
    borderWidth: element.style?.borderWidth || '0',
    borderStyle: element.style?.borderStyle || 'solid',
    borderColor: element.style?.borderColor || '#000000',
    borderRadius: element.style?.borderRadius || '0',
  };
  
  // Style update handlers
  const handleColorChange = (e) => {
    updateElement({ 
      ...element, 
      style: { 
        ...element.style, 
        color: e.target.value 
      } 
    });
  };
  
  const handleBgColorChange = (e) => {
    updateElement({ 
      ...element, 
      style: { 
        ...element.style, 
        backgroundColor: e.target.value 
      } 
    });
  };
  
  const handleFontSizeChange = (e) => {
    const fontSize = `${e.target.value}px`;
    updateElement({ 
      ...element, 
      style: { 
        ...element.style, 
        fontSize
      } 
    });
  };
  
  const toggleBold = () => {
    const fontWeight = element.style?.fontWeight === 'bold' ? 'normal' : 'bold';
    updateElement({ 
      ...element, 
      style: { 
        ...element.style, 
        fontWeight
      } 
    });
  };
  
  const toggleItalic = () => {
    const fontStyle = element.style?.fontStyle === 'italic' ? 'normal' : 'italic';
    updateElement({ 
      ...element, 
      style: { 
        ...element.style, 
        fontStyle
      } 
    });
  };
  
  const setTextAlign = (align) => {
    updateElement({ 
      ...element, 
      style: { 
        ...element.style, 
        textAlign: align
      } 
    });
  };
  
  const handlePaddingChange = (e) => {
    updateElement({
      ...element,
      style: {
        ...element.style,
        padding: `${e.target.value}px`
      }
    });
  };
  
  const handleBorderWidthChange = (e) => {
    updateElement({
      ...element,
      style: {
        ...element.style,
        borderWidth: `${e.target.value}px`,
        borderStyle: element.style?.borderStyle || 'solid'
      }
    });
  };
  
  const handleBorderColorChange = (e) => {
    updateElement({
      ...element,
      style: {
        ...element.style,
        borderColor: e.target.value
      }
    });
  };
  
  const handleBorderRadiusChange = (e) => {
    updateElement({
      ...element,
      style: {
        ...element.style,
        borderRadius: `${e.target.value}px`
      }
    });
  };
  
  return (
    <div className="border-0 shadow-none">
      <div className="px-3 py-2 border-b flex flex-row items-center justify-between">
        <h3 className="text-sm font-medium">Style Editor</h3>
        <button 
          className="text-gray-500 hover:text-gray-700" 
          onClick={onClose}
        >
          ×
        </button>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b">
        <button
          className={`px-3 py-2 text-xs ${activeTab === 'text' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('text')}
        >
          Text
        </button>
        <button
          className={`px-3 py-2 text-xs ${activeTab === 'background' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('background')}
        >
          Background
        </button>
        <button
          className={`px-3 py-2 text-xs ${activeTab === 'border' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('border')}
        >
          Border
        </button>
      </div>
      
      <div className="p-3 space-y-4">
        {activeTab === 'text' && (
          <>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500">Font Style</label>
              <div className="flex space-x-1">
                <button 
                  className={`w-8 h-8 flex items-center justify-center rounded ${styles.isBold ? 'bg-blue-500 text-white' : 'border border-gray-300'}`}
                  onClick={toggleBold}
                >
                  <Bold size={14} />
                </button>
                <button 
                  className={`w-8 h-8 flex items-center justify-center rounded ${styles.isItalic ? 'bg-blue-500 text-white' : 'border border-gray-300'}`}
                  onClick={toggleItalic}
                >
                  <Italic size={14} />
                </button>
                <button 
                  className={`w-8 h-8 flex items-center justify-center rounded ${styles.textAlign === 'left' ? 'bg-blue-500 text-white' : 'border border-gray-300'}`}
                  onClick={() => setTextAlign('left')}
                >
                  <AlignLeft size={14} />
                </button>
                <button 
                  className={`w-8 h-8 flex items-center justify-center rounded ${styles.textAlign === 'center' ? 'bg-blue-500 text-white' : 'border border-gray-300'}`}
                  onClick={() => setTextAlign('center')}
                >
                  <AlignCenter size={14} />
                </button>
                <button 
                  className={`w-8 h-8 flex items-center justify-center rounded ${styles.textAlign === 'right' ? 'bg-blue-500 text-white' : 'border border-gray-300'}`}
                  onClick={() => setTextAlign('right')}
                >
                  <AlignRight size={14} />
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500">Font Size</label>
              <div className="flex items-center space-x-2">
                <input 
                  type="range" 
                  min="8" 
                  max="48" 
                  value={styles.fontSize}
                  onChange={handleFontSizeChange}
                  className="flex-1"
                />
                <span className="text-xs w-8 text-center">{styles.fontSize}px</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500">Text Color</label>
              <div className="flex">
                <input 
                  type="color" 
                  value={styles.color}
                  onChange={handleColorChange}
                  className="w-8 h-8 p-0 border-0"
                />
                <input 
                  type="text" 
                  value={styles.color}
                  onChange={handleColorChange}
                  className="w-full ml-2 text-xs border rounded p-1"
                />
              </div>
            </div>
          </>
        )}
        
        {activeTab === 'background' && (
          <>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500">Background Color</label>
              <div className="flex">
                <input 
                  type="color" 
                  value={styles.bgColor}
                  onChange={handleBgColorChange}
                  className="w-8 h-8 p-0 border-0"
                />
                <input 
                  type="text" 
                  value={styles.bgColor}
                  onChange={handleBgColorChange}
                  className="w-full ml-2 text-xs border rounded p-1"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500">Padding</label>
              <div className="flex items-center space-x-2">
                <input 
                  type="range" 
                  min="0" 
                  max="20" 
                  value={parseInt(styles.padding) || 0}
                  onChange={handlePaddingChange}
                  className="flex-1"
                />
                <span className="text-xs w-8 text-center">{parseInt(styles.padding) || 0}px</span>
              </div>
            </div>
          </>
        )}
        
        {activeTab === 'border' && (
          <>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500">Border Width</label>
              <div className="flex items-center space-x-2">
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  value={parseInt(styles.borderWidth) || 0}
                  onChange={handleBorderWidthChange}
                  className="flex-1"
                />
                <span className="text-xs w-8 text-center">{parseInt(styles.borderWidth) || 0}px</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500">Border Color</label>
              <div className="flex">
                <input 
                  type="color" 
                  value={styles.borderColor}
                  onChange={handleBorderColorChange}
                  className="w-8 h-8 p-0 border-0"
                />
                <input 
                  type="text" 
                  value={styles.borderColor}
                  onChange={handleBorderColorChange}
                  className="w-full ml-2 text-xs border rounded p-1"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500">Border Radius</label>
              <div className="flex items-center space-x-2">
                <input 
                  type="range" 
                  min="0" 
                  max="20" 
                  value={parseInt(styles.borderRadius) || 0}
                  onChange={handleBorderRadiusChange}
                  className="flex-1"
                />
                <span className="text-xs w-8 text-center">{parseInt(styles.borderRadius) || 0}px</span>
              </div>
            </div>
          </>
        )}

        <div className="pt-2">
          <button 
            className="w-full bg-blue-600 text-white rounded py-1.5 text-sm flex items-center justify-center"
            onClick={onClose}
          >
            Apply Styles
          </button>
        </div>
      </div>
    </div>
  );
};

export default StylesPanel;