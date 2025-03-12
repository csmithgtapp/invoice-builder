export default class OrderService {
    constructor() {
      // Replace with your Google Apps Script web app URL
      this.apiUrl = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec';
    }
  
    async getOrderById(orderId) {
      try {
        // Google Apps Script web apps don't support CORS, 
        // so we'll use JSONP approach with a callback parameter
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          const callbackName = `jsonpCallback_${Date.now()}`;
          
          // Create a global callback function
          window[callbackName] = (data) => {
            // Clean up
            delete window[callbackName];
            document.body.removeChild(script);
            
            if (data.error) {
              reject(new Error(data.error));
            } else {
              resolve(data);
            }
          };
          
          // Build the URL with callback and order ID
          script.src = `${this.apiUrl}?id=${orderId}&callback=${callbackName}`;
          script.onerror = () => {
            delete window[callbackName];
            document.body.removeChild(script);
            reject(new Error('Failed to fetch order data'));
          };
          
          // Add script to the document
          document.body.appendChild(script);
        });
      } catch (error) {
        console.error('Error fetching order:', error);
        // For debugging, return mock data if API fails
        return this.getMockOrder(orderId);
      }
    }
  
    // For templates
    async getTemplates() {
      // For now, return mock templates
      // In a real app, you'd store these in another sheet
      return [
        {
          id: 'template-1',
          name: 'Standard Invoice',
          type: 'invoice',
          elements: [
            {
              id: '1',
              type: 'heading',
              x: 50,
              y: 50,
              width: 300,
              height: 40,
              content: 'COMMERCIAL INVOICE',
              style: { fontWeight: 'bold', fontSize: '24px' },
              zIndex: 1
            },
            {
              id: '2',
              type: 'dataField',
              x: 50,
              y: 110,
              width: 250,
              height: 30,
              dataField: 'customerName',
              content: 'Customer: {customerName}',
              style: { fontWeight: 'bold' },
              zIndex: 2
            },
            {
              id: '3',
              type: 'dataField',
              x: 50,
              y: 140,
              width: 250,
              height: 60,
              dataField: 'customerAddress',
              content: '{customerAddress}',
              zIndex: 3
            },
            {
              id: '4',
              type: 'dataField',
              x: 400,
              y: 110,
              width: 150,
              height: 30,
              dataField: 'id',
              content: 'Order #: {id}',
              style: { fontWeight: 'bold' },
              zIndex: 4
            },
            {
              id: '5',
              type: 'dataField',
              x: 400,
              y: 140,
              width: 150,
              height: 30,
              dataField: 'orderDate',
              content: 'Date: {orderDate}',
              zIndex: 5
            },
            {
              id: '6',
              type: 'table',
              x: 50,
              y: 220,
              width: 500,
              height: 300,
              dataField: 'items',
              content: 'items',
              tableConfig: {
                columns: [
                  { key: 'name', dataField: 'name', header: 'Item' },
                  { key: 'quantity', dataField: 'quantity', header: 'Qty' },
                  { key: 'unitPrice', dataField: 'unitPrice', header: 'Unit Price' },
                  { key: 'total', dataField: 'total', header: 'Total' }
                ]
              },
              zIndex: 6
            },
            {
              id: '7',
              type: 'dataField',
              x: 400,
              y: 540,
              width: 150,
              height: 30,
              dataField: 'subtotal',
              content: 'Subtotal: ${subtotal}',
              style: { textAlign: 'right' },
              zIndex: 7
            },
            {
              id: '8',
              type: 'dataField',
              x: 400,
              y: 570,
              width: 150,
              height: 30,
              dataField: 'tax',
              content: 'Tax: ${tax}',
              style: { textAlign: 'right' },
              zIndex: 8
            },
            {
              id: '9',
              type: 'dataField',
              x: 400,
              y: 600,
              width: 150,
              height: 40,
              dataField: 'total',
              content: 'Total: ${total}',
              style: { fontWeight: 'bold', textAlign: 'right', fontSize: '18px' },
              zIndex: 9
            }
          ]
        }
      ];
    }
  
    async saveTemplate(template) {
      // In a complete implementation, you would add the template to another sheet
      console.log('Saving template:', template);
      return { ...template, id: `template-${Date.now()}` };
    }
  
    // Mock data for testing without API
    getMockOrder(orderId) {
      return {
        id: orderId,
        customerName: 'Acme Corporation',
        customerAddress: '123 Business Ave, Suite 100, New York, NY 10001',
        items: [
          { id: 'item-1', name: 'Widget A', quantity: 5, unitPrice: 10.99, total: 54.95 },
          { id: 'item-2', name: 'Super Widget B', quantity: 2, unitPrice: 24.99, total: 49.98 }
        ],
        orderDate: '2025-03-01',
        subtotal: 104.93,
        tax: 8.39,
        total: 113.32,
        status: 'Processing'
      };
    }
  }