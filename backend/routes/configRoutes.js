const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const https = require('https');

// Ruta protegida para entregar API Key al frontend
router.get('/amazon-location', authMiddleware, (req, res) => {
    res.json({
        apiKey: process.env.AMAZON_LOCATION_API_KEY || ''
    });
});

// Proxy backend para Geocoding usando Amazon Location Service Places API V2
// Endpoint correcto: places.geo.{region}.amazonaws.com/v2/geocode?key={apiKey}
// Referencia: https://docs.aws.amazon.com/location/latest/developerguide/api-keys.html
router.post('/geocode', authMiddleware, (req, res) => {
    const { QueryText } = req.body;
    const apiKey = process.env.AMAZON_LOCATION_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ success: false, message: 'API Key de Amazon no configurada' });
    }
    if (!QueryText) {
        return res.status(400).json({ success: false, message: 'QueryText es requerido' });
    }

    const bodyData = JSON.stringify({
        QueryText: QueryText.trim(),
        MaxResults: 1,
        BiasPosition: [-97.3930, 18.4620],   // Centro de Tehuacán [lng, lat]
        FilterCountries: ['MEX']              // Solo México
    });

    // /v2/ es el prefijo requerido para la V2 de Amazon Location Service con API Keys
    const options = {
        hostname: 'places.geo.us-east-2.amazonaws.com',
        path: `/v2/geocode?key=${apiKey}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Content-Length': Buffer.byteLength(bodyData),
            'User-Agent': 'SAS-C4-Backend/1.0'
        }
    };

    console.log(`[Geocoding] Amazon Location V2 para: "${QueryText}"`);

    const awsReq = https.request(options, (awsRes) => {
        let data = '';
        awsRes.on('data', chunk => data += chunk);
        awsRes.on('end', () => {
            try {
                const parsed = JSON.parse(data);
                const items = parsed.ResultItems ? parsed.ResultItems.length : 0;
                console.log(`[Geocoding] HTTP ${awsRes.statusCode} | "${QueryText}" → ${items} resultado(s)`);
                if (awsRes.statusCode !== 200) {
                    console.error('[Geocoding] Error Amazon:', data);
                }
                res.status(awsRes.statusCode).json(parsed);
            } catch (e) {
                console.error('[Geocoding] Error parseando respuesta:', data.substring(0, 300));
                res.status(500).json({ success: false, message: 'Respuesta inválida de Amazon Location' });
            }
        });
    });

    awsReq.on('error', (error) => {
        console.error('[Geocoding] Error de conexión:', error.message, error.code);
        res.status(500).json({ success: false, message: 'Error de conexión', error: error.message });
    });

    awsReq.setTimeout(10000, () => {
        awsReq.destroy();
        res.status(503).json({ success: false, message: 'Timeout con Amazon Location Service' });
    });

    awsReq.write(bodyData);
    awsReq.end();
});

module.exports = router;
