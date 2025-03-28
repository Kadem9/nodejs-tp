const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');

require('dotenv').config();

const app = express();
connectDB();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const lockerRoutes = require('./routes/lockerRoutes');
app.use('/api/lockers', lockerRoutes);

const reservationRoutes = require('./routes/reservationRoutes');
app.use('/api/reservations', reservationRoutes);

const { checkReservations } = require('./services/reservationService');

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));

setInterval(checkReservations, 60 * 1000);
