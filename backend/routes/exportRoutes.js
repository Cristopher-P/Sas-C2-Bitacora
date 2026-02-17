const express = require('express');
const router = express.Router();
const Exporters = require('../utils/exporters');
const PDFGenerator = require('../utils/pdfGenerator');
const LlamadaBitacora = require('../models/LlamadaBitacora');
const EnvioC5 = require('../models/EnvioC5');

// Exportar llamadas a Excel
router.get('/llamadas/excel', async (req, res) => {
    try {
        const { year, month, ...filtros } = req.query;
        
        let data = await LlamadaBitacora.findAll(filtros);
        
        // Filtrar por mes si se especifica
        if (year && month) {
            data = Exporters.filterByMonth(data, year, month);
        }
        
        const filename = Exporters.generateFilename('llamadas', 'xlsx', !!(year && month));
        const buffer = await Exporters.exportToExcel(data, filename, {
            sheetName: 'Llamadas Bitácora'
        });
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);
        
    } catch (error) {
        console.error('Error exportando Excel:', error);
        res.status(500).json({ error: error.message });
    }
});

// Exportar llamadas a CSV
router.get('/llamadas/csv', async (req, res) => {
    try {
        const { year, month, ...filtros } = req.query;
        
        let data = await LlamadaBitacora.findAll(filtros);
        
        if (year && month) {
            data = Exporters.filterByMonth(data, year, month);
        }
        
        const filename = Exporters.generateFilename('llamadas', 'csv', !!(year && month));
        const csv = Exporters.exportToCSV(data);
        
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(csv);
        
    } catch (error) {
        console.error('Error exportando CSV:', error);
        res.status(500).json({ error: error.message });
    }
});

// Exportar llamadas a PDF
router.get('/llamadas/pdf', async (req, res) => {
    try {
        const { id, year, month, ...filtros } = req.query;
        
        let data;
        if (id) {
            data = await LlamadaBitacora.findById(id);
        } else {
            data = await LlamadaBitacora.findAll(filtros);
            if (year && month) {
                data = Exporters.filterByMonth(data, year, month);
            }
        }
        
        const pdfBuffer = year && month 
            ? await PDFGenerator.generateMonthlyReport(data, year, month)
            : await PDFGenerator.generateBitacoraPDF(data);
        
        const filename = Exporters.generateFilename('bitacora', 'pdf', !!(year && month));
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(pdfBuffer);
        
    } catch (error) {
        console.error('Error generando PDF:', error);
        res.status(500).json({ error: error.message });
    }
});

// Exportar reportes C5 a Excel
router.get('/c5/excel', async (req, res) => {
    try {
        const { year, month, ...filtros } = req.query;
        
        let data = await EnvioC5.findAll(filtros);
        
        if (year && month) {
            data = Exporters.filterByMonth(data, year, month);
        }
        
        const filename = Exporters.generateFilename('reportes_c5', 'xlsx', !!(year && month));
        const buffer = await Exporters.exportToExcel(data, filename, {
            sheetName: 'Reportes C5'
        });
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);
        
    } catch (error) {
        console.error('Error exportando Excel C5:', error);
        res.status(500).json({ error: error.message });
    }
});

// Exportar reportes C5 a PDF
router.get('/c5/pdf', async (req, res) => {
    try {
        const { year, month, ...filtros } = req.query;
        
        let data = await EnvioC5.findAll(filtros);
        
        if (year && month) {
            data = Exporters.filterByMonth(data, year, month);
        }
        
        const pdfBuffer = year && month
            ? await PDFGenerator.generateMonthlyReport(data, year, month)
            : await PDFGenerator.generateBitacoraPDF(data);
        
        const filename = Exporters.generateFilename('reportes_c5', 'pdf', !!(year && month));
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(pdfBuffer);
        
    } catch (error) {
        console.error('Error generando PDF C5:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
