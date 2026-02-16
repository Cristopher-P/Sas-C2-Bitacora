// frontend/js/config/app.config.js
const AppConfig = {
    // API Base URL
    API_BASE_URL: window.location.origin + '/api',
    
    // Configuración de notificaciones
    TOAST_DEFAULT_DURATION: 3000,
    
    // Configuración de tema
    THEME_STORAGE_KEY: 'theme',
    DEFAULT_THEME: 'light',
    
    // Configuración de tablas
    TABLE_DEFAULT_PAGESIZE: 10,
    TABLE_PAGESIZES: [10, 25, 50, 100],
    
    // Mensajes del sistema
    MESSAGES: {
        ERROR_NETWORK: 'Error de conexión con el servidor',
        ERROR_UNAUTHORIZED: 'No autorizado. Por favor inicia sesión',
        ERROR_SERVER: 'Error interno del servidor',
        SUCCESS_SAVE: 'Guardado exitosamente',
        SUCCESS_DELETE: 'Eliminado exitosamente',
        SUCCESS_UPDATE: 'Actualizado exitosamente'
    },
    
    // Configuración de exportación
    EXPORT: {
        FILENAME_PREFIX: 'sas_c4',
        DATE_FORMAT: 'YYYY-MM-DD',
        SUPPORTED_FORMATS: ['excel', 'csv', 'pdf']
    },
    
    // Información del sistema
    APP_NAME: 'SAS C4 - Bitácora de Llamadas',
    APP_VERSION: '1.0.0',
    
    // Endpoints
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login',
            LOGOUT: '/auth/logout',
            VERIFY: '/auth/verify'
        },
        LLAMADAS: {
            LIST: '/llamadas',
            CREATE: '/llamadas',
            UPDATE: '/llamadas/:id',
            DELETE: '/llamadas/:id',
            STATS: '/llamadas/stats'
        },
        C5: {
            LIST: '/c5',
            CREATE: '/c5',
            UPDATE: '/c5/:id'
        },
        EXPORT: {
            LLAMADAS_EXCEL: '/export/llamadas/excel',
            LLAMADAS_CSV: '/export/llamadas/csv',
            LLAMADAS_PDF: '/export/llamadas/pdf',
            C5_EXCEL: '/export/c5/excel',
            C5_PDF: '/export/c5/pdf'
        },
        HEALTH: {
            STATUS: '/status',
            SYSTEM_INFO: '/system-info',
            TEST_DB: '/test-db'
        }
    }
};

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.AppConfig = AppConfig;
}

// Para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppConfig;
}
