const LlamadaBitacora = require('./backend/models/LlamadaBitacora');
const LlamadaController = require('./backend/controllers/LlamadaController');

(async () => {
    try {
        console.log("Probando update...");
        await LlamadaBitacora.update(10, 'llamadas_bitacora_02_2026', { latitud: 18.0, longitud: -97.0, ubicacion_exacta: 1 });
        console.log("Exitoso");
        process.exit(0);
    } catch (e) {
        console.error("Error capturado:", e);
        process.exit(1);
    }
})();
