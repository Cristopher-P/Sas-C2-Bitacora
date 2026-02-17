// backend/routes/healthRoutes.js - Rutas de salud del sistema
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const config = require('../config/app.config');
const LlamadaBitacora = require('../models/LlamadaBitacora');
const EnvioC5 = require('../models/EnvioC5');

// Status básico
router.get('/status', (req, res) => {
    res.json({
        status: 'online',
        system: config.APP_NAME,
        version: config.APP_VERSION,
        timestamp: new Date().toISOString(),
        environment: config.NODE_ENV
    });
});

// Test de base de datos
router.get('/test-db', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 AS ok');
        res.json({ 
            db: 'connected', 
            result: rows 
        });
    } catch (err) {
        console.error('DB ERROR:', err);
        res.status(500).json({ 
            db: 'error', 
            error: err.message 
        });
    }
});

// System info detallado
router.get('/system-info', async (req, res) => {
    let dbConnected = false;
    
    // Intentar verificar conexión con una query simple
    try {
        await db.query('SELECT 1');
        dbConnected = true;
    } catch (err) {
        console.error('Database connection check failed:', err.message);
        dbConnected = false;
    }
    
    try {
        let usuariosCount = 0;
        let llamadasCount = 0;
        let reportesCount = 0;
        
        if (dbConnected) {
            const [users] = await db.execute('SELECT COUNT(*) as count FROM usuarios');
            usuariosCount = users[0]?.count || 0;
            
            llamadasCount = await LlamadaBitacora.countAllRaw();
            const reportes = await EnvioC5.findAll();
            reportesCount = reportes.length;
        } else {
            usuariosCount = config.MOCK_USERS.length;
            llamadasCount = LlamadaBitacora.getMockLlamadas().length;
            reportesCount = EnvioC5.getMockEnvios().length;
        }
        
        res.json({
            status: 'online',
            database: {
                connected: dbConnected,
                mode: dbConnected ? 'MySQL Real' : '⚠️  MODO MOCK',
                host: process.env.MYSQLHOST || 'localhost',
                name: config.DB_NAME
            },
            data: {
                usuarios: usuariosCount,
                llamadas: llamadasCount,
                reportes_c5: reportesCount
            },
            environment: {
                nodeEnv: config.NODE_ENV,
                port: config.PORT
            },
            timestamp: new Date().toISOString(),
            message: dbConnected ? 'Sistema funcionando con MySQL' : '⚠️  MySQL desconectado - usando datos de prueba'
        });
    } catch (error) {
        res.json({
            status: 'online',
            database: {
                connected: false,
                mode: '⚠️  MODO MOCK (error)',
                error: error.message
            },
            data: {
                usuarios: 4,
                llamadas: 15,
                reportes_c5: 10
            },
            timestamp: new Date().toISOString(),
            message: '⚠️  Sistema en modo resistente - usando datos mock'
        });
    }
});

module.exports = router;
