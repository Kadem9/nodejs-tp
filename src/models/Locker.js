const mongoose = require('mongoose');

const LockerSchema = new mongoose.Schema({
  number: { type: Number, required: true, unique: true },
  size: { type: String, enum: ['small', 'medium', 'large'], required: true },
  status: { type: String, enum: ['available', 'reserved'], default: 'available' },
  price: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Locker', LockerSchema);
