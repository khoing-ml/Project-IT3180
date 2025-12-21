const express = require('express');
const router = express.Router();
const accessCardController = require('../controllers/accessCardController');
const { verifyToken } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

// GET routes
router.get('/', accessCardController.getAllCards);
router.get('/:id', accessCardController.getCardById);
router.get('/resident/:residentId', accessCardController.getResidentCards);
router.get('/status/:status', accessCardController.getCardsByStatus);

// POST routes
router.post('/', accessCardController.createCard);

// PUT routes
router.put('/:id/status', accessCardController.updateCardStatus);
router.put('/:id/report-lost', accessCardController.reportCardLost);

// DELETE routes
router.delete('/:id', accessCardController.deleteCard);

module.exports = router;
