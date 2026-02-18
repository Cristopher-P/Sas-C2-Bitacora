const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");
const appConfig = require('../config/app.config');

class AWSService {
    constructor() {
        // Inicializar cliente SQS con credenciales del .env
        this.sqsClient = new SQSClient({
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });
        this.queueUrl = process.env.AWS_SQS_QUEUE_URL;
    }

    /**
     * Enviar reporte a la cola SQS
     * @param {Object} reporte - Datos del reporte a enviar
     * @returns {Promise<Object>} Resultado del envío
     */
    async enviarReporte(reporte) {
        if (!this.queueUrl) {
            throw new Error('AWS_SQS_QUEUE_URL no está definida en las variables de entorno');
        }

        const params = {
            QueueUrl: this.queueUrl,
            MessageBody: JSON.stringify(reporte),
            MessageAttributes: {
                "Tipo": {
                    DataType: "String",
                    StringValue: "NuevoReporte"
                },
                "Fuente": {
                    DataType: "String",
                    StringValue: "SAS-C4"
                }
            }
        };

        try {
            const command = new SendMessageCommand(params);
            const data = await this.sqsClient.send(command);
            console.log("✅ Mensaje enviado a SQS:", data.MessageId);
            return {
                success: true,
                messageId: data.MessageId,
                originalResponse: data
            };
        } catch (err) {
            console.error("🔥 Error enviando a SQS:", err);
            throw err;
        }
    }
}

// Exportar una instancia única (Singleton)
module.exports = new AWSService();
