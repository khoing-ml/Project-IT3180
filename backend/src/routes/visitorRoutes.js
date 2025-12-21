const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitorController');
const { verifyToken } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

// GET routes
router.get('/', visitorController.getAllVisitors);
router.get('/pending', visitorController.getPendingVisitors);
router.get('/:id', visitorController.getVisitorById);

// POST routes
router.post('/', visitorController.createVisitor);

// PUT routes
router.put('/:id/status', visitorController.updateVisitorStatus);
router.put('/:id/cancel', visitorController.cancelVisitor);

// DELETE routes
router.delete('/:id', visitorController.deleteVisitor);

module.exports = router;
