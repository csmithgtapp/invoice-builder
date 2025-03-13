export default class OrderService {
  constructor() {
    // Replace with your API endpoint
    this.apiUrl = 'https://api.example.com/orders';
  }
  
  async getOrderById(orderId) {
    try {
      // Use modern fetch API instead of JSONP
      const response = await fetch(`${this.apiUrl}/${orderId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch order: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching order:', error);
      // For development/demo purposes, return mock data if API fails
      return this.getMockOrder(orderId);
    }
  }
  
  // For templates
  async getTemplates() {
    try {
      const response = await fetch(`${this.apiUrl}/templates`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch templates: ${response.statusText}`);
      }
      
      const templates = await response.json();
      return templates;
    } catch (error) {
      console.error('Error fetching templates:', error);
      // Return mock templates for development
      return this.getMockTemplates();
    }
  }
  
  async saveTemplate(template) {
    try {
      const response = await fetch(`${this.apiUrl}/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save template: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error saving template:', error);
      // For development, mock a successful save
      return { ...template, id: `template-${Date.now()}` };
    }
  }
  
  // Mock data for testing without API
  getMockOrder(orderId) {
    return {
      id: orderId || 'INV-12345',
      customerName: 'Acme Corporation',
      customerAddress: '123 Business Ave, Suite 100, New York, NY 10001',
      items: [
        { id: 'item-1', name: 'Widget A', quantity: 5, unitPrice: 10.99, total: 54.95 },
        { id: 'item-2', name: 'Super Widget B', quantity: 2, unitPrice: 24.99, total: 49.98 },
        { id: 'item-3', name: 'Premium Service', quantity: 1, unitPrice: 100.00, total: 100.00 }
      ],
      orderDate: '2025-03-12',
      shipDate: '2025-03-15',
      shipVia: 'Express Shipping',
      subtotal: 204.93,
      tax: 16.39,
      shipping: 15.00,
      total: 236.32,
      currency: 'USD',
      status: 'Processing',
      terms: 'Net 30',
      notes: 'Please handle with care.'
    };
  }
  
  // Mock templates
  getMockTemplates() {
    return [
      {
        id: 'template-1',
        name: 'Standard Invoice',
        type: 'invoice',
        elements: [
          {
            id: '1',
            type: 'heading',
            x: 200,
            y: 50,
            width: 250,
            height: 40,
            content: 'COMMERCIAL INVOICE',
            style: { fontWeight: 'bold', fontSize: '18px', textAlign: 'center' },
            zIndex: 1
          },
          {
            id: '2',
            type: 'text',
            x: 50,
            y: 120,
            width: 200,
            height: 80,
            content: 'From:\\nYour Company Name\\n123 Business St\\nCity, State, ZIP',
            style: { fontSize: '12px' },
            zIndex: 2
          },
          {
            id: '3',
            type: 'dataField',
            x: 350,
            y: 120,
            width: 200,
            height: 30,
            dataField: 'id',
            content: 'Invoice #: {id}',
            style: { fontSize: '12px', fontWeight: 'bold' },
            zIndex: 3
          },
          {
            id: '4',
            type: 'dataField',
            x: 350,
            y: 150,
            width: 200,
            height: 30,
            dataField: 'orderDate',
            content: 'Date: {orderDate}',
            style: { fontSize: '12px' },
            zIndex: 4
          },
          {
            id: '5',
            type: 'dataField',
            x: 50,
            y: 220,
            width: 200,
            height: 30,
            dataField: 'customerName',
            content: 'Customer: {customerName}',
            style: { fontSize: '12px', fontWeight: 'bold' },
            zIndex: 5
          },
          {
            id: '6',
            type: 'table',
            x: 50,
            y: 270,
            width: 500,
            height: 200,
            content: 'items',
            dataField: 'items',
            zIndex: 6
          },
          {
            id: '7',
            type: 'dataField',
            x: 400,
            y: 500,
            width: 150,
            height: 30,
            dataField: 'subtotal',
            content: 'Subtotal: ${subtotal}',
            style: { fontSize: '12px', textAlign: 'right' },
            zIndex: 7
          },
          {
            id: '8',
            type: 'dataField',
            x: 400,
            y: 530,
            width: 150,
            height: 30,
            dataField: 'tax',
            content: 'Tax: ${tax}',
            style: { fontSize: '12px', textAlign: 'right' },
            zIndex: 8
          },
          {
            id: '9',
            type: 'dataField',
            x: 400,
            y: 560,
            width: 150,
            height: 30,
            dataField: 'total',
            content: 'Total: ${total}',
            style: { fontSize: '14px', textAlign: 'right', fontWeight: 'bold' },
            zIndex: 9
          }
        ]
      },
      {
        id: 'template-2',
        name: 'Minimal Invoice',
        type: 'invoice',
        elements: [
          {
            id: '1',
            type: 'heading',
            x: 50,
            y: 50,
            width: 250,
            height: 40,
            content: 'INVOICE',
            style: { fontWeight: 'bold', fontSize: '24px' },
            zIndex: 1
          },
          {
            id: '2',
            type: 'dataField',
            x: 50,
            y: 100,
            width: 200,
            height: 30,
            dataField: 'id',
            content: '# {id}',
            style: { fontSize: '14px', fontWeight: 'bold' },
            zIndex: 2
          },
          {
            id: '3',
            type: 'table',
            x: 50,
            y: 150,
            width: 500,
            height: 300,
            content: 'items',
            dataField: 'items',
            zIndex: 3
          },
          {
            id: '4',
            type: 'dataField',
            x: 400,
            y: 470,
            width: 150,
            height: 40,
            dataField: 'total',
            content: 'Total Due: ${total}',
            style: { fontSize: '16px', fontWeight: 'bold', textAlign: 'right' },
            zIndex: 4
          }
        ]
      }
    ];
  }
}