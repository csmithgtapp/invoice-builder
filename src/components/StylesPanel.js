import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Input, Label } from './ui/input';
import { Button } from './ui/button';
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

const StylesPanel = ({ element, updateElement, onClose }) => {
  if (!element) return null;
  
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
  
  // Extract current style values
  const currentFontSize = element.style?.fontSize ? parseInt(element.style.fontSize) : 14;
  const isBold = element.style?.fontWeight === 'bold';
  const isItalic = element.style?.fontStyle === 'italic';
  const textAlign = element.style?.textAlign || 'left';
  const color = element.style?.color || '#000000';
  const bgColor = element.style?.backgroundColor || '#ffffff';
  
  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-3 py-2 border-b flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Style Editor</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
      </CardHeader>
      <CardContent className="p-3 space-y-4">
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-500">Font Style</Label>
          <div className="flex space-x-1">
            <Button 
              variant={isBold ? "default" : "outline"} 
              size="sm"
              className="w-8 h-8 p-0"
              onClick={toggleBold}
            >
              <Bold size={14} />
            </Button>
            <Button 
              variant={isItalic ? "default" : "outline"} 
              size="sm"
              className="w-8 h-8 p-0"
              onClick={toggleItalic}
            >
              <Italic size={14} />
            </Button>
            <Button 
              variant={textAlign === 'left' ? "default" : "outline"} 
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => setTextAlign('left')}
            >
              <AlignLeft size={14} />
            </Button>
            <Button 
              variant={textAlign === 'center' ? "default" : "outline"} 
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => setTextAlign('center')}
            >
              <AlignCenter size={14} />
            </Button>
            <Button 
              variant={textAlign === 'right' ? "default" : "outline"} 
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => setTextAlign('right')}
            >
              <AlignRight size={14} />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-500">Font Size</Label>
          <div className="flex items-center space-x-2">
            <Input 
              type="range" 
              min="8" 
              max="48" 
              value={currentFontSize}
              onChange={handleFontSizeChange}
              className="flex-1"
            />
            <span className="text-xs w-8 text-center">{currentFontSize}px</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-500">Text Color</Label>
            <div className="flex">
              <Input 
                type="color" 
                value={color}
                onChange={handleColorChange}
                className="w-8 h-8 p-0 border-0"
              />
              <Input 
                type="text" 
                value={color}
                onChange={handleColorChange}
                className="w-full ml-2 text-xs"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-500">Background</Label>
            <div className="flex">
              <Input 
                type="color" 
                value={bgColor}
                onChange={handleBgColorChange}
                className="w-8 h-8 p-0 border-0"
              />
              <Input 
                type="text" 
                value={bgColor}
                onChange={handleBgColorChange}
                className="w-full ml-2 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Button 
            variant="default"
            size="sm"
            className="w-full"
            onClick={onClose}
          >
            Apply Styles
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StylesPanel;