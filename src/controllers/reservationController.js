const Reservation = require('../models/Reservation');
const Locker = require('../models/Locker');

// reservation d'un casier
exports.bookLocker = async (req, res) => {
    try {
      console.log("📌 Réservation demandée:", req.body);
      
      const { lockerId, duration } = req.body;
      const userId = req.user.id;
  
      const locker = await Locker.findById(lockerId);
      if (!locker) return res.status(404).json({ message: 'Casier non trouvé' });
  
      if (locker.status === 'reserved') {
        console.log("Casier déjà réservé !");
        return res.status(400).json({ message: 'Casier déjà réservé' });
      }
  
      const reservation = await Reservation.create({ user: userId, locker: lockerId, duration });
  
      console.log("Réservation enregistrée:", reservation);
  
      locker.status = 'reserved';
      await locker.save();
      console.log("🔄 Statut du casier mis à jour:", locker);
  
      res.status(201).json({ message: 'Casier réservé', reservation });
    } catch (error) {
      console.error("Erreur lors de la réservation:", error);
      res.status(500).json({ message: 'Erreur serveur', error });
    }
  };
  

// possibilité de voir tt les résa
exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().populate('user', 'name email').populate('locker');
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// liberer un casier (annulation)
exports.cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Réservation non trouvée' });

    const locker = await Locker.findById(reservation.locker);
    locker.status = 'available';
    await locker.save();

    await Reservation.findByIdAndDelete(req.params.id);

    res.json({ message: 'Réservation annulée et casier libéré' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};
