const express = require('express');
const router = express.Router();
const experienceController = require('../controllers/experience.controller');

// Public routes - for users
router.get('/active', experienceController.getActiveExperiences);
router.get('/featured', experienceController.getActiveExperiences); // with featured=true query
router.get('/options', experienceController.getExperienceOptions);
router.get('/:id', experienceController.getExperienceById);

// Admin routes - for content management
router.get('/', experienceController.getAllExperiences);
router.get('/stats/overview', experienceController.getExperienceStats);
router.post('/', experienceController.createExperience);
router.put('/:id', experienceController.updateExperience);
router.delete('/:id', experienceController.deleteExperience);
router.patch('/:id/toggle-status', experienceController.toggleExperienceStatus);
router.patch('/:id/toggle-featured', experienceController.toggleExperienceFeatured);
router.patch('/reorder', experienceController.reorderExperiences);

module.exports = router;
