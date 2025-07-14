const mongoose = require('mongoose');

const LockerSchema = new mongoose.Schema({
  number: { type: Number, required: true, unique: true },
  size: { type: String, enum: ['small', 'medium', 'large'], required: true },
  status: { type: String, enum: ['available', 'reserved', 'occupied', 'maintenance'], default: 'available' },
  price: { type: Number, required: true },
  
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true, enum: ['Lyon', 'Villeurbanne'] },
    postalCode: { type: String, required: true },
    neighborhood: { type: String, required: true }
  },
  
  partner: {
    name: { type: String, required: true },
    type: { type: String, enum: ['commerce', 'bureau', 'residence'], required: true },
    phone: { type: String },
    email: { type: String }
  },
  
  openingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  
  features: {
    hasCamera: { type: Boolean, default: false },
    hasLighting: { type: Boolean, default: true },
    isAccessible: { type: Boolean, default: true },
    maxWeight: { type: Number, default: 10 }
  },
  
  stats: {
    totalReservations: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    lastUsed: { type: Date }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

LockerSchema.index({ location: '2dsphere' });

LockerSchema.index({ 'address.city': 1, status: 1 });

LockerSchema.methods.getDistanceFrom = function(coordinates) {
  const R = 6371;
  const lat1 = this.location.coordinates[1];
  const lon1 = this.location.coordinates[0];
  const lat2 = coordinates[1];
  const lon2 = coordinates[0];
  
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

module.exports = mongoose.model('Locker', LockerSchema);
