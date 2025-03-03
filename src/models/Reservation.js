const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  locker: { type: mongoose.Schema.Types.ObjectId, ref: 'Locker', required: true },
  startTime: { type: Date, default: Date.now },
  duration: { type: Number, required: true },
  endTime: { type: Date }
});

ReservationSchema.pre('save', function (next) {
  this.endTime = new Date(this.startTime.getTime() + this.duration * 60 * 60 * 1000);
  next();
});

module.exports = mongoose.model('Reservation', ReservationSchema);
