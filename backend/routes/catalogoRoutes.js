const express = require('express');
const router = express.Router();
const CatalogoController = require('../controllers/CatalogoController');
const { verifyToken } = require('../controllers/authController');

// All catalogue routes require authentication (logged in operators)
router.use(verifyToken);

// PUBLIC API (Operators & Admins): Get active catalogs by type
router.get('/:tipo', CatalogoController.getByType);

module.exports = router;
