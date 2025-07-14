const express = require('express');
const { bookLocker, getAllReservations, getUserReservations, getReservation, cancelReservation, updateReservation } = require('../controllers/reservationController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, bookLocker);  // reservation
router.get('/user', authMiddleware, getUserReservations);  // voir ses propres résa
router.get('/:id', authMiddleware, getReservation);  // voir une résa spécifique
router.get('/', authMiddleware, getAllReservations);  //voir toutes les résa (admin)
router.patch('/:id', authMiddleware, updateReservation);  // mettre à jour une résa
router.delete('/:id', authMiddleware, cancelReservation);  // annuler une résa

module.exports = router;
