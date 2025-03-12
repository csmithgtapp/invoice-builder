import React from 'react';

const OrderDataPanel = ({
  orderData,
  orderId,
  setOrderId,
  handleFetchOrder,
  showPlaceholders,
  setShowPlaceholders
}) => {
  return (
    <div className="mb-6">
      <h3 className="font-medium mb-2">Order Data</h3>
      <div className="flex mb-2">
        <input
          type="text"
          placeholder="Enter Order ID"
          className="flex-1 p-2 border rounded-l"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-3 py-2 rounded-r"
          onClick={() => handleFetchOrder(orderId)}
        >
          Fetch
        </button>
      </div>
      
      {orderData ? (
        <div className="p-2 bg-green-100 rounded mb-2 text-sm">
          <p><strong>Order #{orderData.id}</strong></p>
          <p>{orderData.customerName}</p>
          <p>Total: ${orderData.total.toFixed(2)}</p>
        </div>
      ) : (
        <p className="text-sm text-gray-500">No order data loaded</p>
      )}
      
      <div className="flex items-center mb-2">
        <input
          type="checkbox"
          checked={showPlaceholders}
          onChange={() => setShowPlaceholders(!showPlaceholders)}
          id="showPlaceholders"
          className="mr-2"
        />
        <label htmlFor="showPlaceholders" className="text-sm">Show data previews</label>
      </div>
    </div>
  );
};

export default OrderDataPanel;