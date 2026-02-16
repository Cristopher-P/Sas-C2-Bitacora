// Frontend - Gestor de impresión
class PrintManager {
    // Imprimir tabla
    static printTable(tableId, title = 'Reporte') {
        const table = document.getElementById(tableId);
        if (!table) {
            console.error('Tabla no encontrada:', tableId);
            return;
        }
        
        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <style>
                    @media print {
                        @page { margin: 1cm; }
                    }
                    body { font-family: Arial, sans-serif; }
                    h1 { text-align: center; color: #333; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
                    th { background-color: #4472C4; color: white; }
                    tr:nth-child(even) { background-color: #f2f2f2; }
                    .print-date { text-align: center; font-size: 10px; color: #666; margin-top: 10px; }
                </style>
            </head>
            <body>
                <h1>${title}</h1>
                ${table.outerHTML}
                <div class="print-date">
                    Generado el ${new Date().toLocaleString('es-MX')}
                </div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    }
    
    // Imprimir contenido personalizado
    static printContent(elementId, title = 'Documento') {
        const element = document.getElementById(elementId);
        if (!element) {
            console.error('Elemento no encontrado:', elementId);
            return;
        }
        
        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <style>
                    @media print {
                        @page { margin: 1.5cm; }
                    }
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1, h2, h3 { color: #333; }
                </style>
            </head>
            <body>
                ${element.innerHTML}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    }
    
    // Vista previa antes de imprimir
    static showPrintPreview(content, title = 'Vista Previa') {
        const preview = window.open('', '', 'width=900,height=700');
        preview.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .preview-header { 
                        background: #f5f5f5; 
                        padding: 10px; 
                        border-bottom: 2px solid #333;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .preview-content { padding: 20px; }
                    button { 
                        padding: 10px 20px; 
                        background: #4472C4; 
                        color: white; 
                        border: none; 
                        cursor: pointer; 
                        border-radius: 4px;
                    }
                    button:hover { background: #365a9c; }
                </style>
            </head>
            <body>
                <div class="preview-header">
                    <h2>${title}</h2>
                    <button onclick="window.print()">🖨️ Imprimir</button>
                </div>
                <div class="preview-content">
                    ${content}
                </div>
            </body>
            </html>
        `);
        preview.document.close();
    }
}

window.PrintManager = PrintManager;
