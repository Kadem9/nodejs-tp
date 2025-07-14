const express = require('express');
const { 
  createPayment, 
  confirmPayment, 
  refundPayment, 
  getPaymentDetails,
  handleWebhook,
  verifyPayment
} = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();


router.post('/create', authMiddleware, createPayment);  // Créer un paiement
router.post('/confirm', authMiddleware, confirmPayment);  // Confirmer un paiement
router.post('/refund/:reservationId', authMiddleware, refundPayment);  // Rembourser
router.get('/details/:paymentIntentId', authMiddleware, getPaymentDetails);  // Détails paiement
router.get('/verify/:sessionId', authMiddleware, verifyPayment);  // Vérifier paiement

module.exports = router; 