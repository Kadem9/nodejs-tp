const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  locker: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Locker', 
    required: true 
  },
  startTime: { 
    type: Date, 
    default: Date.now,
    required: true
  },
  duration: { 
    type: Number, 
    required: true,
    min: [1, 'La durée minimum est de 1 heure'],
    max: [168, 'La durée maximum est de 7 jours (168 heures)']
  },
  endTime: { 
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  totalPrice: {
    type: Number
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentIntentId: {
    type: String
  },
  checkoutSessionId: {
    type: String
  },
  stripeCustomerId: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

ReservationSchema.pre('save', async function (next) {
  this.endTime = new Date(this.startTime.getTime() + this.duration * 60 * 60 * 1000);
  
  if (!this.totalPrice) {
    let pricePerDay = 3;
    try {
      const Locker = mongoose.model('Locker');
      const locker = await Locker.findById(this.locker);
      if (locker && locker.price) pricePerDay = locker.price;
    } catch (e) {}
    const days = this.duration / 24;
    this.totalPrice = Math.ceil(days * pricePerDay * 100) / 100;
  }
  this.updatedAt = new Date();
  next();
});

ReservationSchema.methods.isActive = function() {
  const now = new Date();
  return this.status === 'active' && this.endTime > now;
};

ReservationSchema.methods.isExpired = function() {
  const now = new Date();
  return this.endTime <= now;
};

ReservationSchema.index({ user: 1, status: 1 });
ReservationSchema.index({ locker: 1, status: 1 });
ReservationSchema.index({ endTime: 1 });

module.exports = mongoose.model('Reservation', ReservationSchema);
