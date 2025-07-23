const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();

const app = express();
connectDB();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

const { handleWebhook } = require('./controllers/paymentController');
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), handleWebhook);

app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/lockers', require('./routes/lockerRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/export', require('./routes/exportRoutes'));

const { cleanupExpiredReservations } = require('./services/reservationService');

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {});

setInterval(async () => {
  try {
    await cleanupExpiredReservations();
  } catch (error) {
  }
}, 5 * 60 * 1000);
