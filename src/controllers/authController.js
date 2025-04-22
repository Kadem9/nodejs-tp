const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS
  }
});

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

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

      const token = crypto.randomBytes(20).toString('hex');
      const expiration = Date.now() + 3600000; // 1h

      user.resetPasswordToken = token;
      user.resetPasswordExpires = expiration;
      await user.save();

      const resetUrl = `http://localhost:5173/reset-password/${token}`; // frontend

      const mailOptions = {
          to: user.email,
          from: 'noreply@reservation-casiers.com',
          subject: 'Réinitialisation de mot de passe',
          html: `
              <p>Salut ${user.name},</p>
              <p>Tu as demandé une réinitialisation de mot de passe.</p>
              <p>Clique ici pour le faire : <a href="${resetUrl}">${resetUrl}</a></p>
              <p>Ce lien expire dans 1 heure.</p>
          `
      };

      await transporter.sendMail(mailOptions);

      res.json({ message: "E-mail envoyé avec le lien de réinitialisation" });

  } catch (error) {
      console.error("Erreur forgotPassword:", error);
      res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
      const user = await User.findOne({
          resetPasswordToken: token,
          resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
          return res.status(400).json({ message: 'Lien de réinitialisation invalide ou expiré.' });
      }

      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save();

      res.json({ message: 'Mot de passe mis à jour avec succès.' });

  } catch (error) {
      console.error('Erreur resetPassword:', error);
      res.status(500).json({ message: 'Erreur serveur' });
  }
};
