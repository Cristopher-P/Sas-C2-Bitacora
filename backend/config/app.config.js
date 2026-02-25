
module.exports = {
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',

    DB_NAME: process.env.MYSQLDATABASE || process.env.DB_NAME || 'sas_c4_db',

    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',

    JWT_SECRET: process.env.JWT_SECRET || 'c4-secret-key-2024',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',

    APP_NAME: 'SAS C4 - Bitácora de Llamadas',
    APP_VERSION: '1.0.0',

    MOCK_USERS: [
        { username: 'admin', password: 'password123', turno: 'Todos', rol: 'admin' },
        { username: 'matutino', password: 'password123', turno: 'Matutino', rol: 'supervisor' },
        { username: 'vespertino', password: 'password123', turno: 'Vespertino', rol: 'supervisor' },
        { username: 'nocturno', password: 'password123', turno: 'Nocturno', rol: 'supervisor' }
    ],

    C5_API_URL: process.env.C5_API_URL || 'http://localhost:4000/api/recepcion/c4'
};
