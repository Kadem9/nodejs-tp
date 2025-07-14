const mongoose = require('mongoose');
const Locker = require('../models/Locker');
require('dotenv').config();

const locations = [
  // Lyon - Centre
  { name: 'Presqu\'île', city: 'Lyon', coordinates: [4.8357, 45.7640], postalCode: '69001' },
  { name: 'Vieux Lyon', city: 'Lyon', coordinates: [4.8270, 45.7597], postalCode: '69005' },
  { name: 'Croix-Rousse', city: 'Lyon', coordinates: [4.8317, 45.7719], postalCode: '69004' },
  
  // Lyon - Est
  { name: 'Part-Dieu', city: 'Lyon', coordinates: [4.8600, 45.7600], postalCode: '69003' },
  { name: 'Brotteaux', city: 'Lyon', coordinates: [4.8700, 45.7650], postalCode: '69006' },
  { name: 'Monplaisir', city: 'Lyon', coordinates: [4.8800, 45.7450], postalCode: '69008' },
  
  // Lyon - Ouest
  { name: 'Terreaux', city: 'Lyon', coordinates: [4.8300, 45.7670], postalCode: '69001' },
  { name: 'Confluence', city: 'Lyon', coordinates: [4.8150, 45.7450], postalCode: '69002' },
  
  // Villeurbanne
  { name: 'Centre Villeurbanne', city: 'Villeurbanne', coordinates: [4.8800, 45.7650], postalCode: '69100' },
  { name: 'Gratte-Ciel', city: 'Villeurbanne', coordinates: [4.8850, 45.7700], postalCode: '69100' },
  { name: 'Cusset', city: 'Villeurbanne', coordinates: [4.8750, 45.7750], postalCode: '69100' },
  { name: 'Charpennes', city: 'Villeurbanne', coordinates: [4.8700, 45.7700], postalCode: '69100' }
];

// Types de partenaires
const partners = [
  { name: 'Carrefour City', type: 'commerce' },
  { name: 'Monoprix', type: 'commerce' },
  { name: 'Boulangerie Pâtisserie', type: 'commerce' },
  { name: 'Pharmacie', type: 'commerce' },
  { name: 'Bureau de Poste', type: 'bureau' },
  { name: 'Résidence étudiante', type: 'residence' },
  { name: 'Immeuble de bureaux', type: 'bureau' }
];

// Horaires d'ouverture standard
const standardHours = {
  monday: { open: '08:00', close: '20:00' },
  tuesday: { open: '08:00', close: '20:00' },
  wednesday: { open: '08:00', close: '20:00' },
  thursday: { open: '08:00', close: '20:00' },
  friday: { open: '08:00', close: '20:00' },
  saturday: { open: '09:00', close: '19:00' },
  sunday: { open: '10:00', close: '18:00' }
};

// Horaires pour les résidences
const residenceHours = {
  monday: { open: '06:00', close: '23:00' },
  tuesday: { open: '06:00', close: '23:00' },
  wednesday: { open: '06:00', close: '23:00' },
  thursday: { open: '06:00', close: '23:00' },
  friday: { open: '06:00', close: '23:00' },
  saturday: { open: '06:00', close: '23:00' },
  sunday: { open: '06:00', close: '23:00' }
};

// Fonction pour générer des coordonnées aléatoires autour d'un point
function generateRandomCoordinates(centerLat, centerLng, radiusKm = 0.5) {
  const radiusInDegrees = radiusKm / 111.32; // 1 degré ≈ 111.32 km
  const randomAngle = Math.random() * 2 * Math.PI;
  const randomRadius = Math.sqrt(Math.random()) * radiusInDegrees;
  
  const lat = centerLat + randomRadius * Math.cos(randomAngle);
  const lng = centerLng + randomRadius * Math.sin(randomAngle);
  
  return [lng, lat];
}

// Fonction pour générer une adresse
function generateAddress(location, partner) {
  const streetNumbers = ['15', '23', '45', '67', '89', '123', '156', '234', '345', '456'];
  const streetNames = [
    'Rue de la République', 'Avenue Jean Jaurès', 'Boulevard de la Croix-Rousse',
    'Rue Garibaldi', 'Avenue des Frères Lumière', 'Rue de la Part-Dieu',
    'Boulevard de Stalingrad', 'Rue de la Soie', 'Avenue Roger Salengro',
    'Rue Anatole France', 'Boulevard de la Villette', 'Rue du 4 Août 1789'
  ];
  
  return {
    street: `${streetNumbers[Math.floor(Math.random() * streetNumbers.length)]} ${streetNames[Math.floor(Math.random() * streetNames.length)]}`,
    city: location.city,
    postalCode: location.postalCode,
    neighborhood: location.name
  };
}

// Fonction pour créer des casiers
async function seedLockers() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/lockerlyon';
    
    if (!mongoUri) {
      process.exit(1);
    }

    await mongoose.connect(mongoUri);

    await Locker.deleteMany({});

    const lockers = [];
    let lockerNumber = 1;

    // Créer des casiers pr chq loc
    for (const location of locations) {
      const numLockers = Math.floor(Math.random() * 8) + 3; // 3 à 10 casiers par loc
      
      for (let i = 0; i < numLockers; i++) {
        const partner = partners[Math.floor(Math.random() * partners.length)];
        const coordinates = generateRandomCoordinates(location.coordinates[1], location.coordinates[0]);
        const address = generateAddress(location, partner);
        
        const locker = {
          number: lockerNumber++,
          size: ['small', 'medium', 'large'][Math.floor(Math.random() * 3)],
          status: Math.random() > 0.2 ? 'available' : 'reserved', // 80% disponibles
          price: Math.floor(Math.random() * 3) + 3, // 3€ à 5€
          location: {
            type: 'Point',
            coordinates: coordinates
          },
          address: address,
          partner: {
            name: partner.name,
            type: partner.type,
            phone: `0${Math.floor(Math.random() * 90000000) + 10000000}`,
            email: `contact@${partner.name.toLowerCase().replace(/\s+/g, '')}.fr`
          },
          openingHours: partner.type === 'residence' ? residenceHours : standardHours,
          features: {
            hasCamera: Math.random() > 0.5,
            hasLighting: true,
            isAccessible: Math.random() > 0.1, // 90% accessibles
            maxWeight: [5, 10, 15][Math.floor(Math.random() * 3)]
          },
          stats: {
            totalReservations: Math.floor(Math.random() * 50),
            averageRating: Math.random() * 2 + 3, // 3 à 5 étoiles
            lastUsed: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null
          }
        };
        
        lockers.push(locker);
      }
    }

    // Insérer tous les casiers
    await Locker.insertMany(lockers);

    // Afficher quelques statistiques
    const stats = await Locker.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          available: { $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] } },
          byCity: { $push: '$address.city' }
        }
      }
    ]);

    if (stats.length > 0) {
      const stat = stats[0];
      const lyonCount = stat.byCity.filter(city => city === 'Lyon').length;
      const villeurbanneCount = stat.byCity.filter(city => city === 'Villeurbanne').length;
    }

    process.exit(0);

  } catch (error) {
    process.exit(1);
  }
}

seedLockers();