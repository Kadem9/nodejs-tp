const mongoose = require('mongoose');
require('dotenv').config();

const Reservation = require('../models/Reservation');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/casier-app')
  .then(() => console.log('Connecté à MongoDB'))
  .catch(err => console.error('Erreur de connexion MongoDB:', err));

async function cleanupExpiredReservations() {
  try {
    const now = new Date();
    
    const expiredReservations = await Reservation.find({
      endTime: { $lt: now },
      status: { $ne: 'cancelled' }
    });

    console.log(`Trouvé ${expiredReservations.length} réservation(s) expirée(s)`);

    if (expiredReservations.length > 0) {
      const result = await Reservation.updateMany(
        {
          endTime: { $lt: now },
          status: { $ne: 'cancelled' }
        },
        {
          $set: { status: 'expired' }
        }
      );

      console.log(`${result.modifiedCount} réservation(s) marquée(s) comme expirée(s)`);
      
      expiredReservations.forEach(reservation => {
        console.log(`- Réservation ID: ${reservation._id}, Utilisateur: ${reservation.userId}, Casier: ${reservation.lockerId}, Fin: ${reservation.endTime}`);
      });
    } else {
      console.log('Aucune réservation expirée trouvée');
    }

  } catch (error) {
    console.error('Erreur lors du nettoyage des réservations:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Connexion MongoDB fermée');
    process.exit(0);
  }
}

cleanupExpiredReservations(); 