const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const protect = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');

// tt les routes demande un accès admin

// Export de toutes les réservations (avec filtres optionnels)
// exemple: GET /api/export/reservations?status=active&startDate=2024-01-01&endDate=2024-12-31
router.get('/reservations', protect, adminOnly, exportController.exportReservations);

// Export des statistiques
//exemple : GET /api/export/stats
router.get('/stats', protect, adminOnly, exportController.exportStats);

// Export des réservations d'un utilisateur spécifique
// exemple:GET /api/export/user/:userId
router.get('/user/:userId', protect, adminOnly, exportController.exportUserReservations);

module.exports = router; 