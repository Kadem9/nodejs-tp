const Locker = require('../models/Locker');

exports.getAllLockers = async (req, res) => {
  try {
    const { 
      city, 
      neighborhood, 
      status, 
      size, 
      minPrice, 
      maxPrice,
      lat,
      lng,
      radius = 5 // rayon en km
    } = req.query;

    let query = {};

    if (city) {
      query['address.city'] = city;
    }

    if (neighborhood) {
      query['address.neighborhood'] = neighborhood;
    }

    if (status) {
      query.status = status;
    }

    if (size) {
      query.size = size;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    let lockers;

    if (lat && lng) {
      const coordinates = [parseFloat(lng), parseFloat(lat)];
      
      lockers = await Locker.find({
        ...query,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: coordinates
            },
            $maxDistance: radius * 1000
          }
        }
      }).sort({ 'location.coordinates': 1 });
    } else {
      lockers = await Locker.find(query).sort({ createdAt: -1 });
    }

    if (lat && lng) {
      const userCoordinates = [parseFloat(lng), parseFloat(lat)];
      lockers = lockers.map(locker => {
        const distance = locker.getDistanceFrom(userCoordinates);
        return {
          ...locker.toObject(),
          distance: Math.round(distance * 100) / 100
        };
      });
    }

    res.json({
      success: true,
      count: lockers.length,
      data: lockers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des casiers',
      error: error.message
    });
  }
};

exports.getLockerById = async (req, res) => {
  try {
    const locker = await Locker.findById(req.params.id);
    
    if (!locker) {
      return res.status(404).json({
        success: false,
        message: 'Casier non trouvé'
      });
    }

    res.json({
      success: true,
      data: locker
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du casier',
      error: error.message
    });
  }
};

exports.createLocker = async (req, res) => {
  try {
    const locker = new Locker(req.body);
    await locker.save();

    res.status(201).json({
      success: true,
      message: 'Casier créé avec succès',
      data: locker
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la création du casier',
      error: error.message
    });
  }
};

exports.updateLocker = async (req, res) => {
  try {
    const locker = await Locker.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!locker) {
      return res.status(404).json({
        success: false,
        message: 'Casier non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Casier mis à jour avec succès',
      data: locker
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour du casier',
      error: error.message
    });
  }
};

exports.deleteLocker = async (req, res) => {
  try {
    const locker = await Locker.findByIdAndDelete(req.params.id);

    if (!locker) {
      return res.status(404).json({
        success: false,
        message: 'Casier non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Casier supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du casier',
      error: error.message
    });
  }
};

exports.getLockerStats = async (req, res) => {
  try {
    const stats = await Locker.aggregate([
      {
        $group: {
          _id: null,
          totalLockers: { $sum: 1 },
          availableLockers: {
            $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] }
          },
          reservedLockers: {
            $sum: { $cond: [{ $eq: ['$status', 'reserved'] }, 1, 0] }
          },
          occupiedLockers: {
            $sum: { $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0] }
          },
          averagePrice: { $avg: '$price' },
          totalReservations: { $sum: '$stats.totalReservations' }
        }
      }
    ]);

    const cityStats = await Locker.aggregate([
      {
        $group: {
          _id: '$address.city',
          count: { $sum: 1 },
          available: {
            $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] }
          }
        }
      }
    ]);

    const neighborhoodStats = await Locker.aggregate([
      {
        $group: {
          _id: '$address.neighborhood',
          count: { $sum: 1 },
          city: { $first: '$address.city' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        overall: stats[0] || {},
        byCity: cityStats,
        byNeighborhood: neighborhoodStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};

exports.getNearbyLockers = async (req, res) => {
  try {
    const { lat, lng, radius = 2 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Coordonnées lat et lng requises'
      });
    }

    const coordinates = [parseFloat(lng), parseFloat(lat)];

    const lockers = await Locker.find({
      status: 'available',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: coordinates
          },
          $maxDistance: radius * 1000
        }
      }
    }).limit(10);

    const lockersWithDistance = lockers.map(locker => {
      const distance = locker.getDistanceFrom(coordinates);
      return {
        ...locker.toObject(),
        distance: Math.round(distance * 100) / 100
      };
    });

    res.json({
      success: true,
      count: lockersWithDistance.length,
      data: lockersWithDistance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche des casiers proches',
      error: error.message
    });
  }
};

exports.getNeighborhoods = async (req, res) => {
  try {
    const { city } = req.query;
    
    let query = {};
    if (city) {
      query['address.city'] = city;
    }

    const neighborhoods = await Locker.distinct('address.neighborhood', query);
    
    res.json({
      success: true,
      data: neighborhoods.sort()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des quartiers',
      error: error.message
    });
  }
};
