const Locker = require('../models/Locker');

//  ajout un casier
exports.addLocker = async (req, res) => {
  try {
    const { number, size, price } = req.body;

    const existingLocker = await Locker.findOne({ number });
    if (existingLocker) return res.status(400).json({ message: 'Ce casier existe déjà' });

    const newLocker = await Locker.create({ number, size, price });
    res.status(201).json(newLocker);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// recup tt les casiers
exports.getAllLockers = async (req, res) => {
  try {
    const lockers = await Locker.find();
    res.json(lockers);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// modifier un casier
exports.updateLocker = async (req, res) => {
  try {
    const { number, size, status, price } = req.body;

    const locker = await Locker.findByIdAndUpdate(
      req.params.id,
      { number, size, status, price },
      { new: true }
    );

    if (!locker) return res.status(404).json({ message: 'Casier non trouvé' });

    res.json(locker);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// supprimer un casier
exports.deleteLocker = async (req, res) => {
  try {
    const locker = await Locker.findByIdAndDelete(req.params.id);

    if (!locker) return res.status(404).json({ message: 'Casier non trouvé' });

    res.json({ message: 'Casier supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};
