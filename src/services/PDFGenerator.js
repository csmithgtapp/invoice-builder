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
              this.currentFontSize = 12;
              this.currentFillColor = '#000000';
              this.currentDrawColor = '#000000';
              this.currentTextColor = '#000000';
            }
            
            text(text, x, y, options) {
              console.log(`Adding text: ${text} at (${x}, ${y})`);
              this.content.push({ type: 'text', text, x, y, options });
              return this;
            }
            
            setFontSize(size) {
              this.currentFontSize = size;
              return this;
            }
            
            setFillColor(r, g, b) {
              this.currentFillColor = `rgb(${r}, ${g}, ${b})`;
              return this;
            }
            
            setDrawColor(r, g, b) {
              this.currentDrawColor = `rgb(${r}, ${g}, ${b})`;
              return this;
            }
            
            setTextColor(r, g, b) {
              this.currentTextColor = `rgb(${r}, ${g}, ${b})`;
              return this;
            }
            
            rect(x, y, w, h, style) {
              console.log(`Adding rectangle at (${x}, ${y}) with size ${w}x${h}`);
              this.content.push({ 
                type: 'rect', 
                x, y, w, h, 
                style, 
                fillColor: this.currentFillColor,
                drawColor: this.currentDrawColor
              });
              return this;
            }
            
            line(x1, y1, x2, y2) {
              console.log(`Adding line from (${x1}, ${y1}) to (${x2}, ${y2})`);
              this.content.push({ 
                type: 'line', 
                x1, y1, x2, y2,
                drawColor: this.currentDrawColor
              });
              return this;
            }
            
            addPage() {
              console.log('Adding new page');
              this.content.push({ type: 'page' });
              return this;
            }
            
            save(filename) {
              console.log(`PDF would be saved as ${filename} with ${this.content.length} elements`);
              alert(`PDF export successful: ${filename}\n\nElements: ${this.content.length}`);
              return this;
            }
          }
        });
      });
    };
  }

  async generatePDF(elements, orderData, orderId, getValueFromPath) {
    try {
      console.log('Starting PDF generation...');
      
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
          const value = getValueFromPath ? getValueFromPath(element.dataField) : null;
          
          if (typeof content === 'string' && value !== null) {
            // Replace {fieldName} with actual value
            content = content.replace(new RegExp(`\\{${element.dataField}\\}`, 'g'), value);
          }
        }
        
        switch(element.type) {
          case 'heading':
            pdf.setFontSize(18);
            if (element.style?.fontWeight === 'bold') {
              pdf.setTextColor(0, 0, 0); // Black text for headings
            }
            pdf.text(content, x, y + 5, { 
              maxWidth: width,
              align: element.style?.textAlign || 'left'
            });
            break;
          
          case 'text':
            pdf.setFontSize(element.style?.fontSize ? parseInt(element.style.fontSize) : 12);
            pdf.setTextColor(0, 0, 0);
            
            // Handle multi-line text
            if (typeof content === 'string' && content.includes('\\n')) {
              const lines = content.split('\\n');
              lines.forEach((line, index) => {
                pdf.text(line, x, y + 5 + (index * 5), { 
                  maxWidth: width,
                  align: element.style?.textAlign || 'left'
                });
              });
            } else {
              pdf.text(content, x, y + 5, { 
                maxWidth: width,
                align: element.style?.textAlign || 'left'
              });
            }
            break;
          
          case 'dataField':
            pdf.setFontSize(12);
            pdf.text(content, x, y + 5, { 
              maxWidth: width,
              align: element.style?.textAlign || 'left'
            });
            break;
          
          case 'rectangle':
            if (element.style?.backgroundColor) {
              const bgColor = element.style.backgroundColor;
              // Parse hex color to rgb
              if (bgColor.startsWith('#')) {
                const r = parseInt(bgColor.slice(1, 3), 16);
                const g = parseInt(bgColor.slice(3, 5), 16);
                const b = parseInt(bgColor.slice(5, 7), 16);
                pdf.setFillColor(r, g, b);
              } else {
                pdf.setFillColor(200, 200, 200); // Default gray
              }
            } else {
              pdf.setFillColor(200, 200, 200); // Default gray
            }
            
            pdf.setDrawColor(0, 0, 0);
            pdf.rect(x, y, width, height, 'FD');
            break;
          
          case 'table':
            if (element.dataField === 'items' && orderData && orderData.items && Array.isArray(orderData.items)) {
              const tableData = orderData.items;
              
              // Render table header
              pdf.setFontSize(10);
              pdf.setTextColor(0, 0, 0);
              pdf.setFillColor(240, 240, 240);
              pdf.rect(x, y, width, 8, 'F');
              
              pdf.text('Item', x + 2, y + 5);
              pdf.text('Qty', x + width * 0.4, y + 5);
              pdf.text('Price', x + width * 0.6, y + 5);
              pdf.text('Total', x + width * 0.8, y + 5);
              
              // Draw header separator
              pdf.setDrawColor(200, 200, 200);
              pdf.line(x, y + 8, x + width, y + 8);
              
              // Render table rows
              tableData.forEach((item, index) => {
                const rowY = y + 12 + (index * 8);
                
                // Alternate row background
                if (index % 2 === 0) {
                  pdf.setFillColor(250, 250, 250);
                  pdf.rect(x, rowY - 4, width, 8, 'F');
                }
                
                pdf.setTextColor(0, 0, 0);
                pdf.text(item.name, x + 2, rowY);
                pdf.text(String(item.quantity), x + width * 0.4, rowY);
                pdf.text(`$${item.unitPrice.toFixed(2)}`, x + width * 0.6, rowY);
                pdf.text(`$${item.total.toFixed(2)}`, x + width * 0.8, rowY);
                pdf.setDrawColor(230, 230, 230);
                pdf.line(x, rowY + 4, x + width, rowY + 4);
              });
            } else {
              // Empty table placeholder
              pdf.setFillColor(240, 240, 240);
              pdf.rect(x, y, width, height, 'F');
              pdf.setTextColor(150, 150, 150);
              pdf.text('Table data', x + width/2 - 10, y + height/2);
            }
            break;
          
          case 'list':
            pdf.setFontSize(12);
            if (Array.isArray(content)) {
              content.forEach((item, index) => {
                pdf.text(`• ${item}`, x, y + 5 + (index * 5));
              });
            } else if (typeof content === 'string') {
              pdf.text(`• ${content}`, x, y + 5);
            }
            break;
          
          case 'image':
            // In a real implementation, you would handle images properly
            pdf.setFillColor(240, 240, 240);
            pdf.rect(x, y, width, height, 'F');
            pdf.setTextColor(150, 150, 150);
            pdf.text('Image', x + width/2 - 10, y + height/2);
            break;
        }
      });
      
      // Save the PDF
      console.log('PDF generation complete, saving...');
      pdf.save(`invoice_${orderId}.pdf`);
      return true;
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
      return false;
    }
  }
}