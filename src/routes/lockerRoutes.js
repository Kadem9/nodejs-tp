const express = require('express');
const { addLocker, getAllLockers, updateLocker, deleteLocker } = require('../controllers/lockerController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.post('/', authMiddleware, adminMiddleware, addLocker); // ajout d'un casier
router.get('/', authMiddleware, getAllLockers);  // recup tt les caisers
router.put('/:id', authMiddleware, adminMiddleware, updateLocker); // modifier un caiser
router.delete('/:id', authMiddleware, adminMiddleware, deleteLocker); // supprimer un casier

module.exports = router;

// TODO : Tester les routes admins et les ajouter dans les autres routes également.