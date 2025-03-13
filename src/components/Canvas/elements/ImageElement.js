import React from 'react';
import { Image } from 'lucide-react';

const ImageElement = ({ element, onChange }) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center text-gray-400">
        <Image size={24} className="mb-2" />
        <span className="text-xs">Image</span>
      </div>
    </div>
  );
};

export default ImageElement;