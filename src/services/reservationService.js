const Reservation = require('../models/Reservation');
const Locker = require('../models/Locker');
const emailService = require('./emailService');

exports.cleanupExpiredReservations = async () => {
  try {
    
    const now = new Date();
    
    const expiredReservations = await Reservation.find({
      status: 'active',
      endTime: { $lte: now }
    }).populate('locker');
    
    
    for (const reservation of expiredReservations) {
      reservation.status = 'completed';
      await reservation.save();
      
      if (reservation.locker && reservation.locker.status === 'reserved') {
        const locker = await Locker.findById(reservation.locker._id);
        if (locker) {
          locker.status = 'available';
          await locker.save();
        }
      }
    }
    
    return expiredReservations.length;
  } catch (error) {
    throw error;
  }
};

exports.checkExpiringReservations = async () => {
  try {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    
    const expiringReservations = await Reservation.find({
      status: 'active',
      endTime: { $gt: now, $lte: oneHourFromNow }
    }).populate('user', 'email name').populate('locker', 'number address');
    
    return expiringReservations;
  } catch (error) {
    throw error;
  }
};

exports.sendExpirationReminders = async () => {
  try {
    const now = new Date();
    const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);
    
    const expiringReservations = await Reservation.find({
      status: 'active',
      endTime: { $gt: now, $lte: fifteenMinutesFromNow },
      reminderSent: { $ne: true }
    }).populate('user', 'email name').populate('locker', 'number address');
    
    const sentReminders = [];
    
    for (const reservation of expiringReservations) {
      try {
        await emailService.sendExpirationReminder(reservation.user, reservation, reservation.locker);
        
        reservation.reminderSent = true;
        await reservation.save();
        
        sentReminders.push(reservation._id);
      } catch (emailError) {
        console.error(`Erreur envoi rappel expiration pour réservation ${reservation._id}:`, emailError);
      }
    }
    
    return sentReminders;
  } catch (error) {
    throw error;
  }
};

exports.getReservationStats = async () => {
  try {
    const now = new Date();
    
    const stats = await Reservation.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' }
        }
      }
    ]);
    
    const activeReservations = await Reservation.countDocuments({
      status: 'active',
      endTime: { $gt: now }
    });
    
    const expiredReservations = await Reservation.countDocuments({
      status: 'active',
      endTime: { $lte: now }
    });
    
    return {
      byStatus: stats,
      active: activeReservations,
      expired: expiredReservations
    };
  } catch (error) {
    throw error;
  }
};

exports.validateReservation = async (userId, lockerId, duration) => {
  try {
    const existingReservation = await Reservation.findOne({
      user: userId,
      status: { $in: ['active', 'pending'] },
      endTime: { $gt: new Date() }
    });
    
    if (existingReservation) {
      throw new Error('Vous avez déjà une réservation active');
    }
    
    const locker = await Locker.findById(lockerId);
    if (!locker) {
      throw new Error('Casier non trouvé');
    }
    
    if (locker.status !== 'available') {
      throw new Error('Casier non disponible');
    }
    
    if (duration < 1 || duration > 168) {
      throw new Error('Durée invalide (1h à 7 jours)');
    }
    
    return { valid: true, locker };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};
