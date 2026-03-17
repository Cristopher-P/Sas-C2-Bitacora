const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const llamadasRoutes = require('./llamadasRoutes');
const enviosC5Routes = require('./enviosC5Routes');
const exportRoutes = require('./exportRoutes');
const configRoutes = require('./configRoutes');
const adminRoutes = require('./adminRoutes');

router.use('/auth', authRoutes);
router.use('/llamadas', llamadasRoutes);
router.use('/c5', enviosC5Routes);
router.use('/export', exportRoutes);
router.use('/config', configRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
