const express = require('express');
const { addLocker, getAllLockers, updateLocker, deleteLocker } = require('../controllers/lockerController');

const router = express.Router();

router.post('/', addLocker); // ajout d'un casier
router.get('/', getAllLockers); // recup tt les caisers
router.put('/:id', updateLocker); // modifier un caiser
router.delete('/:id', deleteLocker); // supprimer un casier

module.exports = router;
