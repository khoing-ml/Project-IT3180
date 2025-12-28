const express = require('express');
const router = express.Router();
const residentController = require('../controllers/residentController');

/**
 * @swagger
 * /residents/apartment/{apt_id}:
 *   get:
 *     summary: Get residents for an apartment
 *     tags: [Residents]
 *     parameters:
 *       - in: path
 *         name: apt_id
 *         schema:
 *           type: string
 *         required: true
 *         description: Apartment identifier
 *     responses:
 *       200:
 *         description: List of residents
 *       400:
 *         description: Bad request
 */
router.get('/apartment/:apt_id', residentController.list);

/**
 * @swagger
 * /residents/all:
 *   get:
 *     summary: Get all residents
 *     tags: [Residents]
 *     responses:
 *       200:
 *         description: List of residents
 */
router.get('/all', residentController.listAll);

/**
 * @swagger
 * /residents:
 *   post:
 *     summary: Create a resident
 *     tags: [Residents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               apt_id:
 *                 type: string
 *               full_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               is_owner:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Resident created
 *       400:
 *         description: Bad request
 */
router.post('/', residentController.create);

/**
 * @swagger
 * /residents/{id}:
 *   delete:
 *     summary: Delete a resident
 *     tags: [Residents]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Resident id
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               new_owner_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Resident deleted
 *       400:
 *         description: Bad request or owner transfer required
 */
router.delete('/:id', residentController.delete);

module.exports = router;
