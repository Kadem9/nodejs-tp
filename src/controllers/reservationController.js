const Reservation = require('../models/Reservation');
const Locker = require('../models/Locker');
const User = require('../models/User');
const { validateReservation } = require('../services/reservationService');
const emailService = require('../services/emailService');

exports.bookLocker = async (req, res) => {
    try {
      
      const { lockerId, duration } = req.body;
      const userId = req.user.id;
  
      if (!lockerId || !duration) {
        return res.status(400).json({ message: 'Casier et durée requis' });
      }
      
      const validation = await validateReservation(userId, lockerId, duration);
      
      if (!validation.valid) {
        return res.status(400).json({ message: validation.error });
      }
      
      const { locker } = validation;

      const pricePerDay = locker.price;
      const days = duration / 24;
      const totalPrice = Math.ceil(days * pricePerDay * 100) / 100;

      const reservation = await Reservation.create({
        user: userId, 
        locker: lockerId, 
        duration,
        totalPrice,
        status: 'pending',
        paymentStatus: 'pending'
      });

      try {
        const user = await User.findById(userId);
        await emailService.sendReservationCreated(user, reservation, locker);
      } catch (emailError) {
        console.error('Erreur envoi email réservation créée:', emailError);
      }
  
      res.status(201).json({ 
        message: 'Réservation créée, paiement requis pour confirmer', 
        reservation: {
          _id: reservation._id,
          startTime: reservation.startTime,
          endTime: reservation.endTime,
          duration: reservation.duration,
          totalPrice: reservation.totalPrice,
          status: reservation.status,
          paymentStatus: reservation.paymentStatus,
          locker: {
            _id: locker._id,
            number: locker.number,
            size: locker.size,
            price: locker.price,
            address: locker.address
          }
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  };
  

exports.getReservation = async (req, res) => {
  try {
    const userId = req.user.id;
    const reservationId = req.params.id;
    
    const reservation = await Reservation.findOne({ 
      _id: reservationId,
      user: userId 
    }).populate('locker', 'number size price address status');
    
    if (!reservation) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }
    
    res.json({
      success: true,
      data: reservation
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.getUserReservations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const reservations = await Reservation.find({ user: userId })
      .populate('locker', 'number size address status')
      .sort({ startTime: -1 });
    
    const now = new Date();
    const updatedReservations = [];
    
    for (const reservation of reservations) {
      if (reservation.status === 'active' && reservation.endTime <= now) {
        reservation.status = 'completed';
        await reservation.save();
        
        const locker = await Locker.findById(reservation.locker._id);
        if (locker && locker.status === 'reserved') {
          locker.status = 'available';
          await locker.save();
        }
      }
      updatedReservations.push(reservation);
    }
      
    res.json({
      success: true,
      data: updatedReservations
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('user', 'name email')
      .populate('locker', 'number size address')
      .sort({ startTime: -1 });
    res.json({
      success: true,
      data: reservations
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.cancelReservation = async (req, res) => {
  try {
    const userId = req.user.id;
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }
    
    if (reservation.user.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    const locker = await Locker.findById(reservation.locker);
    if (locker) {
      locker.status = 'available';
      await locker.save();
    }

    await Reservation.findByIdAndDelete(req.params.id);

    res.json({ message: 'Réservation annulée et casier libéré' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    if (reservation.user.toString() !== userId) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    const updatedReservation = await Reservation.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      reservation: updatedReservation
    });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
