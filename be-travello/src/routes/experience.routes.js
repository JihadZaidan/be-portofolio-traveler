const express = require('express');
const router = express.Router();
const {
  getAllExperiences,
  getExperienceById,
  createExperience,
  updateExperience,
  deleteExperience
} = require('../controllers/simple-experience.controller');

console.log('🔧 Experience routes loaded with controller:', Object.keys(require('../controllers/simple-experience.controller')));

// GET /api/experiences - Get all experiences
router.get('/', getAllExperiences);

// GET /api/experiences/:id - Get experience by ID
router.get('/:id', getExperienceById);

// POST /api/experiences - Create new experience
router.post('/', createExperience);

// PUT /api/experiences/:id - Update experience
router.put('/:id', updateExperience);

// DELETE /api/experiences/:id - Delete experience
router.delete('/:id', deleteExperience);

module.exports = router;
