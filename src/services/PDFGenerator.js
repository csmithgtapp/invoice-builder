import _ from 'lodash';

export default class PDFGenerator {
  constructor() {
    this.mockJsPDF = () => {
      return new Promise((resolve) => {
        resolve({
          default: class jsPDF {
            constructor(options) {
              this.options = options;
              this.content = [];
            }
            
            text(text, x, y, options) {
              this.content.push({ type: 'text', text, x, y, options });
            }
            
            setFontSize(size) {
              this.fontSize = size;
            }
            
            setFillColor(color) {
              this.fillColor = color;
            }
            
            setDrawColor(color) {
              this.drawColor = color;
            }
            
            rect(x, y, w, h, style) {
              this.content.push({ type: 'rect', x, y, w, h, style });
            }
            
            line(x1, y1, x2, y2) {
              this.content.push({ type: 'line', x1, y1, x2, y2 });
            }
            
            save(filename) {
              console.log(`Saving PDF: ${filename}`);
              alert(`PDF would be saved as ${filename} with ${this.content.length} elements`);
            }
          }
        });
      });
    };
  }

  async generatePDF(elements, orderData, orderId, getValueFromPath) {
    // In a real implementation, this would use the actual jsPDF library
    const { default: jsPDF } = await this.mockJsPDF();
    
    // Create new PDF document
    const pdf = new jsPDF({
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    });
    
    // Scale factors (canvas px to PDF mm)
    const scaleFactor = 0.264583; // 1px = 0.264583mm
    
    // Sort elements by z-index for proper layering
    const sortedElements = _.sortBy(elements, ['zIndex']);
    
    sortedElements.forEach(element => {
      // Convert positions and dimensions from px to mm
      const x = element.x * scaleFactor;
      const y = element.y * scaleFactor;
      const width = element.width * scaleFactor;
      const height = element.height * scaleFactor;
      
      let content = element.content;
      
      // Handle data binding for dataField type
      if (element.type === 'dataField' && element.dataField && orderData) {
        // Replace template variables with actual data
        const value = getValueFromPath(element.dataField);
        
        if (typeof content === 'string') {
          // Replace {fieldName} with actual value
          content = content.replace(new RegExp(`\\{${element.dataField}\\}`, 'g'), value);
        }
      }
      
      switch(element.type) {
        case 'heading':
        case 'text':
        case 'dataField':
          pdf.setFontSize(element.type === 'heading' ? 18 : 12);
          pdf.text(content, x, y + 5, { 
            maxWidth: width,
            align: 'left'
          });
          break;
          
        case 'rectangle':
          pdf.setFillColor(element.style?.backgroundColor || '#e2e8f0');
          pdf.setDrawColor('#000000');
          pdf.rect(x, y, width, height, 'FD');
          break;
          
        case 'table':
          if (element.dataField && orderData) {
            const tableData = getValueFromPath(element.dataField);
            
            if (Array.isArray(tableData)) {
              // Render table header
              pdf.setFontSize(10);
              pdf.text('Item', x, y + 5);
              pdf.text('Qty', x + width * 0.4, y + 5);
              pdf.text('Price', x + width * 0.6, y + 5);
              pdf.text('Total', x + width * 0.8, y + 5);
              
              // Draw header separator
              pdf.line(x, y + 8, x + width, y + 8);
              
              // Render table rows
              tableData.forEach((item, index) => {
                const rowY = y + 15 + (index * 8);
                pdf.text(item.name, x, rowY);
                pdf.text(String(item.quantity), x + width * 0.4, rowY);
                pdf.text(`$${item.unitPrice.toFixed(2)}`, x + width * 0.6, rowY);
                pdf.text(`$${item.total.toFixed(2)}`, x + width * 0.8, rowY);
              });
            }
          }
          break;
          
        case 'list':
          pdf.setFontSize(12);
          if (Array.isArray(content)) {
            content.forEach((item, index) => {
              pdf.text(`• ${item}`, x, y + 5 + (index * 5));
            });
          }
          break;
          
        case 'image':
          // In a real implementation, you would handle images properly
          pdf.setFillColor('#f0f0f0');
          pdf.rect(x, y, width, height, 'F');
          pdf.text('Image', x + width/4, y + height/2);
          break;
      }
    });
    
    // Save the PDF
    pdf.save(`invoice_${orderId}.pdf`);
  }
}