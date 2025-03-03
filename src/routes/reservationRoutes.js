const express = require('express');
const { bookLocker, getAllReservations, cancelReservation } = require('../controllers/reservationController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, bookLocker);  // reservation
router.get('/', authMiddleware, getAllReservations);  //voir les résa
router.delete('/:id', authMiddleware, cancelReservation);  // annuler une résa

module.exports = router;
