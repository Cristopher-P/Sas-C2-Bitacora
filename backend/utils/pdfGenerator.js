const PDFDocument = require('pdfkit');

class PDFGenerator {
    // Generar PDF oficial de bitácora
    static generateBitacoraPDF(data, options = {}) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ 
                    size: 'LETTER',
                    margins: { top: 50, bottom: 50, left: 50, right: 50 }
                });
                
                const chunks = [];
                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);
                
                // Encabezado oficial
                this.addHeader(doc, options);
                
                // Título
                doc.fontSize(16).font('Helvetica-Bold').fillColor('#000000');
                doc.text('BITÁCORA DE LLAMADAS', { align: 'center' });
                doc.moveDown(0.5);
                
                // Fecha del reporte
                doc.fontSize(10).font('Helvetica');
                const fecha = new Date().toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                doc.text(`Fecha de generación: ${fecha}`, { align: 'center' });
                doc.moveDown(1.5);
                
                // Tabla de registros
                if (Array.isArray(data)) {
                    data.forEach((registro, index) => {
                        this.addRegistro(doc, registro, index + 1);
                        if (index < data.length - 1) {
                            doc.moveDown(1);
                        }
                    });
                } else {
                    this.addRegistro(doc, data, 1);
                }
                
                // Pie de página
                this.addFooter(doc, options);
                
                doc.end();
                
            } catch (error) {
                reject(error);
            }
        });
    }
    
    // Agregar encabezado
    static addHeader(doc, options) {
        const pageWidth = doc.page.width;
        
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text('SISTEMA C4 - BITÁCORA DE LLAMADAS', 50, 30, { 
            width: pageWidth - 100,
            align: 'center'
        });
        
        // Línea separadora
        doc.moveTo(50, 50).lineTo(pageWidth - 50, 50).stroke();
        doc.moveDown(2);
    }
    
    // Agregar registro individual
    static addRegistro(doc, registro, numero) {
        const startY = doc.y;
        
        // Número de folio
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#333333');
        doc.text(`Folio: ${registro.folio_sistema || registro.folio_c4 || numero}`, {
            continued: true
        });
        doc.font('Helvetica').text(`    |    Fecha: ${registro.fecha || registro.fecha_envio}    Hora: ${registro.hora || registro.hora_envio}`);
        doc.moveDown(0.5);
        
        // Información principal
        const fields = [
            { label: 'Turno', value: registro.turno },
            { label: 'Motivo', value: registro.motivo },
            { label: 'Ubicación', value: registro.ubicacion },
            { label: 'Colonia', value: registro.colonia },
            { label: 'Peticionario', value: registro.peticionario },
            { label: 'Agente', value: registro.agente },
            { label: 'Teléfono', value: registro.numero_telefono },
            { label: 'Salida', value: registro.salida },
            { label: 'Detenido', value: registro.detenido },
            { label: 'Descripción', value: registro.descripcion || registro.descripcion_detallada }
        ];
        
        doc.fontSize(9).font('Helvetica');
        fields.forEach(field => {
            if (field.value) {
                doc.font('Helvetica-Bold').text(`${field.label}: `, { 
                    continued: true 
                });
                doc.font('Helvetica').text(field.value);
            }
        });
        
        // Caja alrededor del registro
        const endY = doc.y;
        doc.rect(45, startY - 5, doc.page.width - 90, endY - startY + 10).stroke();
    }
    
    // Agregar pie de página
    static addFooter(doc, options) {
        const pageHeight = doc.page.height;
        const pageWidth = doc.page.width;
        
        doc.fontSize(8).font('Helvetica').fillColor('#666666');
        doc.text(
            `Total de registros: ${options.totalRecords || 1}`,
            50,
            pageHeight - 30,
            { width: pageWidth - 100, align: 'center' }
        );
    }
    
    // Generar PDF mensual
    static async generateMonthlyReport(data, year, month) {
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        const options = {
            title: `Reporte Mensual - ${monthNames[month - 1]} ${year}`,
            totalRecords: data.length
        };
        
        return this.generateBitacoraPDF(data, options);
    }
}

module.exports = PDFGenerator;
