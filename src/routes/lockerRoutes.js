const express = require('express');
const router = express.Router();
const lockerController = require('../controllers/lockerController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/', lockerController.getAllLockers);
router.get('/nearby', lockerController.getNearbyLockers);
router.get('/neighborhoods', lockerController.getNeighborhoods);
router.get('/stats', lockerController.getLockerStats);
router.get('/:id', lockerController.getLockerById);

router.post('/', authMiddleware, adminMiddleware, lockerController.createLocker);
router.put('/:id', authMiddleware, adminMiddleware, lockerController.updateLocker);
router.delete('/:id', authMiddleware, adminMiddleware, lockerController.deleteLocker);

module.exports = router;