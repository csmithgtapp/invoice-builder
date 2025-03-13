import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import _ from 'lodash';

export default class PDFGenerator {
  async generatePDF(elements, orderData, orderId, getValueFromPath) {
    try {
      console.log('Starting PDF generation...');
      
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
            if (element.style?.fontWeight === 'bold') {
              pdf.setFont('helvetica', 'bold');
            } else {
              pdf.setFont('helvetica', 'normal');
            }
            pdf.setFontSize(element.style?.fontSize ? parseInt(element.style.fontSize) : 18);
            pdf.setTextColor(this.parseColor(element.style?.color || '#000000'));
            
            const align = element.style?.textAlign || 'left';
            pdf.text(content, 
              align === 'center' ? x + width/2 : 
              align === 'right' ? x + width : x, 
              y + 5, { 
                align: align,
                maxWidth: width 
              }
            );
            break;
          
          case 'text':
            if (element.style?.fontWeight === 'bold') {
              pdf.setFont('helvetica', 'bold');
            } else {
              pdf.setFont('helvetica', 'normal');
            }
            pdf.setFontSize(element.style?.fontSize ? parseInt(element.style.fontSize) : 12);
            pdf.setTextColor(this.parseColor(element.style?.color || '#000000'));
            
            // Handle multi-line text
            if (typeof content === 'string' && content.includes('\\n')) {
              const lines = content.split('\\n');
              const align = element.style?.textAlign || 'left';
              
              lines.forEach((line, index) => {
                pdf.text(line, 
                  align === 'center' ? x + width/2 : 
                  align === 'right' ? x + width : x, 
                  y + 5 + (index * 5), { 
                    align: align,
                    maxWidth: width 
                  }
                );
              });
            } else {
              const align = element.style?.textAlign || 'left';
              pdf.text(content, 
                align === 'center' ? x + width/2 : 
                align === 'right' ? x + width : x, 
                y + 5, { 
                  align: align,
                  maxWidth: width 
                }
              );
            }
            break;
          
          case 'rectangle':
            const fillColor = this.parseColor(element.style?.backgroundColor || '#e2e8f0');
            const strokeColor = this.parseColor(element.style?.borderColor || '#000000');
            
            pdf.setFillColor(fillColor.r, fillColor.g, fillColor.b);
            pdf.setDrawColor(strokeColor.r, strokeColor.g, strokeColor.b);
            
            // Draw rectangle with fill and/or stroke
            if (element.style?.border) {
              pdf.rect(x, y, width, height, 'FD'); // Fill and Draw
            } else {
              pdf.rect(x, y, width, height, 'F'); // Fill only
            }
            break;
          
          case 'table':
            if (element.dataField === 'items' && orderData && orderData.items && Array.isArray(orderData.items)) {
              const tableData = orderData.items;
              
              // Create table headers array
              const headers = [['Item', 'Qty', 'Price', 'Total']];
              
              // Create table body array
              const body = tableData.map(item => [
                item.name,
                item.quantity.toString(),
                `$${item.unitPrice.toFixed(2)}`,
                `$${item.total.toFixed(2)}`
              ]);
              
              // Use autotable plugin for clean tables
              pdf.autoTable({
                startY: y,
                head: headers,
                body: body,
                theme: 'grid',
                styles: {
                  fontSize: 10,
                  cellPadding: 2
                },
                columnStyles: {
                  0: { cellWidth: width * 0.4 },
                  1: { cellWidth: width * 0.2, halign: 'center' },
                  2: { cellWidth: width * 0.2, halign: 'right' },
                  3: { cellWidth: width * 0.2, halign: 'right' }
                },
                margin: { left: x },
                tableWidth: width
              });
            }
            break;
          
          case 'list':
            pdf.setFontSize(element.style?.fontSize ? parseInt(element.style.fontSize) : 12);
            pdf.setTextColor(this.parseColor(element.style?.color || '#000000'));
            
            if (Array.isArray(content)) {
              content.forEach((item, index) => {
                pdf.text(`• ${item}`, x, y + 5 + (index * 5));
              });
            } else if (typeof content === 'string') {
              pdf.text(`• ${content}`, x, y + 5);
            }
            break;
          
          case 'image':
            // For now, we'll just draw a placeholder rectangle
            pdf.setFillColor(240, 240, 240);
            pdf.rect(x, y, width, height, 'F');
            pdf.setTextColor(150, 150, 150);
            pdf.text('Image', x + width/2, y + height/2, { align: 'center' });
            break;
            
          case 'dataField':
            if (element.style?.fontWeight === 'bold') {
              pdf.setFont('helvetica', 'bold');
            } else {
              pdf.setFont('helvetica', 'normal');
            }
            pdf.setFontSize(element.style?.fontSize ? parseInt(element.style.fontSize) : 12);
            pdf.setTextColor(this.parseColor(element.style?.color || '#000000'));
            
            const dataAlign = element.style?.textAlign || 'left';
            pdf.text(content, 
              dataAlign === 'center' ? x + width/2 : 
              dataAlign === 'right' ? x + width : x, 
              y + 5, { 
                align: dataAlign,
                maxWidth: width 
              }
            );
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
  
  // Helper function to parse color
  parseColor(color) {
    if (!color) return { r: 0, g: 0, b: 0 };
    
    // Handle hex colors
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return { r, g, b };
    } 
    
    // Handle rgb/rgba colors
    if (color.startsWith('rgb')) {
      const values = color.match(/\d+/g);
      if (values && values.length >= 3) {
        return {
          r: parseInt(values[0]),
          g: parseInt(values[1]),
          b: parseInt(values[2])
        };
      }
    }
    
    // Default to black
    return { r: 0, g: 0, b: 0 };
  }
}