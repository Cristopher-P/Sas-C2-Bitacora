require('dotenv').config();
const AWSService = require('./backend/services/AWSService');

async function testConnection() {
    console.log('🔌 Probando conexión a AWS SQS...');
    console.log('📋 Configuración:');
    console.log(`   - Región: ${process.env.AWS_REGION}`);
    console.log(`   - Cola: ${process.env.AWS_SQS_QUEUE_URL}`);
    console.log(`   - Access Key: ${process.env.AWS_ACCESS_KEY_ID ? '******' + process.env.AWS_ACCESS_KEY_ID.slice(-4) : 'NO DEFINIDA'}`);

    const testMessage = {
        folio_c4: 'TEST-CONNECTION-' + Date.now(),
        fecha_envio: new Date().toISOString().split('T')[0],
        hora_envio: new Date().toLocaleTimeString(),
        motivo: 'PRUEBA DE CONEXIÓN',
        ubicacion: 'SISTEMA TEST',
        descripcion: 'Este es un mensaje de prueba para verificar la conexión SQS.',
        meta: {
            source: 'TEST-SCRIPT',
            timestamp: new Date().toISOString()
        }
    };

    try {
        const result = await AWSService.enviarReporte(testMessage);

        if (result.success) {
            console.log('\n✅ ¡ÉXITO! Mensaje enviado correctamente.');
            console.log(`🆔 Message ID: ${result.messageId}`);
            console.log('🚀 La configuración de envío (Sender) es correcta.');
        } else {
            console.error('\n❌ Error: El servicio no devolvió success=true');
        }
    } catch (error) {
        console.error('\n🔥 FALLÓ LA CONEXIÓN:');
        console.error(error.message);
        console.error('\nPosibles causas:');
        console.error('1. Credenciales incorrectas en .env');
        console.error('2. URL de la cola incorrecta');
        console.error('3. El usuario IAM no tiene permisos AmazonSQSFullAccess');
    }
}

testConnection();
