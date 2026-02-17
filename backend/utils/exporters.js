const ExcelJS = require('exceljs');
const converter = require('json-2-csv');

class Exporters {
    // Exportar a Excel con estilos
    static async exportToExcel(data, filename, options = {}) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(options.sheetName || 'Datos');
        
        // Metadatos
        workbook.creator = 'SAS C4 Bitácora';
        workbook.created = new Date();
        workbook.modified = new Date();
        
        if (!data || data.length === 0) {
            throw new Error('No hay datos para exportar');
        }
        
        // Obtener columnas del primer registro
        const columns = options.columns || Object.keys(data[0]).map(key => ({
            header: key.toUpperCase().replace(/_/g, ' '),
            key: key,
            width: 15
        }));
        
        worksheet.columns = columns;
        
        // Estilo del encabezado
        worksheet.getRow(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getRow(1).height = 25;
        
        // Agregar datos
        data.forEach(row => {
            worksheet.addRow(row);
        });
        
        // Bordes para todas las celdas
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });
        
        // Auto-filtro
        worksheet.autoFilter = {
            from: 'A1',
            to: String.fromCharCode(64 + columns.length) + '1'
        };
        
        // Generar buffer
        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;
    }
    
    // Exportar a CSV
    static async exportToCSV(data, options = {}) {
        if (!data || data.length === 0) {
            throw new Error('No hay datos para exportar');
        }
        
        try {
            const csv = await converter.json2csv(data, {
                delimiter: { field: options.delimiter || ',' },
                emptyFieldValue: '',
                prependHeader: options.header !== false
            });
            
            // Agregar BOM para UTF-8 (Excel compatibility)
            return '\ufeff' + csv;
        } catch (error) {
            throw new Error('Error al generar CSV: ' + error.message);
        }
    }
    
    // Filtrar datos por mes
    static filterByMonth(data, year, month) {
        return data.filter(item => {
            const fecha = new Date(item.fecha || item.fecha_envio);
            return fecha.getFullYear() === parseInt(year) && 
                   fecha.getMonth() + 1 === parseInt(month);
        });
    }
    
    // Generar nombre de archivo con fecha
    static generateFilename(prefix, extension, monthly = false) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        
        if (monthly) {
            return `${prefix}_${year}_${month}.${extension}`;
        }
        return `${prefix}_${year}${month}${day}.${extension}`;
    }
}

module.exports = Exporters;
