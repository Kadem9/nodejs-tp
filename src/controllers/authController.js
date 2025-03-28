const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// gestion des inscriptions
exports.register = async (req, res) => {
  try {
      console.log('Données reçues pour inscription :', req.body);

      const { name, email, password } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: 'Email déjà utilisé' });

      const newUser = await User.create({ name, email, password });
      res.status(201).json({ message: 'Utilisateur créé', token: generateToken(newUser) });

  } catch (error) {
      console.error('Erreur lors de l’inscription backend :', error);
      res.status(500).json({ message: 'Erreur serveur', error });
  }
};


// gerstion de la connexion
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Identifiants incorrects' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Identifiants incorrects' });

    const token = generateToken(user);

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};


exports.getProfile = async (req, res) => {
  res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
  });
};

