const express = require('express');
const router = express.Router();
const maintenanceData = require('../data/maintenanceData');

// GET all maintenance requests
router.get('/', (req, res) => {
  res.json(maintenanceData);
});

// GET single maintenance request
router.get('/:id', (req, res) => {
  const request = maintenanceData.find(r => r.id === req.params.id);
  if (request) {
    res.json(request);
  } else {
    res.status(404).json({ error: 'Request not found' });
  }
});

// POST new maintenance request
router.post('/', (req, res) => {
  const { apartment, resident, phone, issue, priority } = req.body;

  if (!apartment || !resident || !issue) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newRequest = {
    id: `M${String(maintenanceData.length + 1).padStart(3, '0')}`,
    apartment,
    resident,
    phone,
    issue,
    status: 'pending',
    priority: priority || 'medium',
    date: new Date().toISOString().split('T')[0],
    notes: req.body.notes || ''
  };

  maintenanceData.push(newRequest);
  res.status(201).json(newRequest);
});

// PUT update maintenance request
router.put('/:id', (req, res) => {
  const request = maintenanceData.find(r => r.id === req.params.id);

  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }

  // Update fields
  if (req.body.status) request.status = req.body.status;
  if (req.body.assignedTo) request.assignedTo = req.body.assignedTo;
  if (req.body.cost) request.cost = req.body.cost;
  if (req.body.notes) request.notes = req.body.notes;
  if (req.body.priority) request.priority = req.body.priority;

  res.json(request);
});

// DELETE maintenance request
router.delete('/:id', (req, res) => {
  const index = maintenanceData.findIndex(r => r.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Request not found' });
  }

  const deleted = maintenanceData.splice(index, 1);
  res.json(deleted[0]);
});

// GET statistics
router.get('/stats/summary', (req, res) => {
  const stats = {
    total: maintenanceData.length,
    pending: maintenanceData.filter(r => r.status === 'pending').length,
    inProgress: maintenanceData.filter(r => r.status === 'in-progress').length,
    completed: maintenanceData.filter(r => r.status === 'completed').length,
    totalCost: maintenanceData.reduce((sum, r) => sum + (r.cost || 0), 0)
  };
  res.json(stats);
});

module.exports = router;
