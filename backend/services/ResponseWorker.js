const { SQSClient, DeleteMessageCommand } = require("@aws-sdk/client-sqs");
const { Consumer } = require('sqs-consumer');
const EnvioC5 = require('../models/EnvioC5');

class ResponseWorker {
    constructor(io) {
        this.queueUrl = process.env.AWS_SQS_RESPONSE_QUEUE_URL;
        this.isRunning = false;
        this.io = io;

        this.sqsClient = new SQSClient({
            region: process.env.AWS_REGION || 'us-east-2',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });
    }

    start() {
        if (this.isRunning) return;
        if (!this.queueUrl) {
            console.log('⚠️ AWS_SQS_RESPONSE_QUEUE_URL no definida. El worker de respuestas no iniciará.');
            return;
        }

        console.log('🔌 Iniciando Response Worker (C4)...');
        console.log('🎯 Escuchando respuestas en:', this.queueUrl);

        const app = Consumer.create({
            queueUrl: this.queueUrl,
            sqs: this.sqsClient,
            handleMessage: async (message) => {
                await this.procesarMensaje(message);
            }
        });

        app.on('error', (err) => {
            console.error('🔥 Error en Response Worker:', err.message);
        });

        app.on('processing_error', (err) => {
            console.error('🔥 Error procesando respuesta:', err.message);
        });

        app.start();
        this.isRunning = true;
        console.log('✅ Response Worker activo.');
    }

    async procesarMensaje(message) {
        try {
            const body = JSON.parse(message.Body);
            console.log('📩 Respuesta recibida:', body);

            if (body.tipo === 'RESPUESTA_FOLIO' && body.folio_c4 && body.folio_c5) {

                console.log(`🔄 Actualizando Folio C4: ${body.folio_c4} con C5: ${body.folio_c5}`);
                await EnvioC5.registrarFolioC5(body.folio_c4, body.folio_c5);
                console.log('✅ Base de datos actualizada correctamente');

                if (this.io) {
                    this.io.emit('reportes_actualizados', {
                        accion: 'folio_asignado',
                        folio_c4: body.folio_c4,
                        folio_c5: body.folio_c5
                    });
                }
            }

        } catch (error) {
            console.error('Error procesando respuesta:', error);

        }
    }
}

module.exports = ResponseWorker;
