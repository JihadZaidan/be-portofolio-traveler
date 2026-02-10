const { Router } = require('express');
const {
  getAllLandingPages,
  getLandingPagesBySection,
  getLandingPageById,
  createLandingPage,
  updateLandingPage,
  deleteLandingPage,
  getHeroSection,
  getAboutSection,
  initController
} = require('../controllers/landing-page.controller.js');

const router = Router();

// Initialize controller
initController().catch(console.error);

// Get all landing pages
router.get('/', getAllLandingPages);

// Get landing pages by section
router.get('/section/:section', getLandingPagesBySection);

// Get hero section data
router.get('/hero', getHeroSection);

// Get about section data
router.get('/about', getAboutSection);

// Get landing page by ID
router.get('/:id', getLandingPageById);

// Create new landing page
router.post('/', createLandingPage);

// Update landing page
router.put('/:id', updateLandingPage);

// Delete landing page
router.delete('/:id', deleteLandingPage);

module.exports = router;
