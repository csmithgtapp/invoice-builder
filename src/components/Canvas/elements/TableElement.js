import React from 'react';

const TableElement = ({ element, data }) => {
  if (!Array.isArray(data)) {
    return (
      <div className="w-full h-full p-2 flex items-center justify-center bg-gray-50 border border-gray-200">
        <p className="text-gray-500 text-sm">Table data will appear here</p>
      </div>
    );
  }
  
  return (
    <div className="w-full h-full overflow-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-1">Item</th>
            <th className="border p-1">Qty</th>
            <th className="border p-1">Price</th>
            <th className="border p-1">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="border p-1">{item.name}</td>
              <td className="border p-1">{item.quantity}</td>
              <td className="border p-1">${item.unitPrice?.toFixed(2)}</td>
              <td className="border p-1">${item.total?.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableElement;