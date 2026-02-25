
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/app.config');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
app.disable('etag');

app.use(helmet({
    contentSecurityPolicy: false
}));
app.use(compression());

app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

app.use(express.static(path.join(__dirname, '../frontend')));

const apiRoutes = require('./routes/index');
const healthRoutes = require('./routes/healthRoutes');

app.use('/api', apiRoutes);
app.use('/api', healthRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
