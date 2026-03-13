const express = require('express');
const router = express.Router();
const travelJournalController = require('../controllers/travelJournal.controller');

// Public routes - for users
router.get('/active', travelJournalController.getActiveJournals);
router.get('/featured', travelJournalController.getActiveJournals); // with featured=true query
router.get('/:id', travelJournalController.getJournalById);
router.get('/:id/preview', travelJournalController.previewJournal);
router.get('/:id/preview-data', travelJournalController.getJournalPreviewData);
router.post('/:id/like', travelJournalController.likeJournal);

// Admin routes - for content management
router.get('/', travelJournalController.getAllJournals);
router.get('/stats/overview', travelJournalController.getJournalStats);
router.post('/', travelJournalController.createJournal);
router.put('/:id', travelJournalController.updateJournal);
router.delete('/:id', travelJournalController.deleteJournal);
router.patch('/:id/toggle-status', travelJournalController.toggleJournalStatus);
router.patch('/:id/toggle-featured', travelJournalController.toggleFeaturedStatus);

module.exports = router;
