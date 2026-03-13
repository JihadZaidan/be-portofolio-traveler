const express = require('express');
const router = express.Router();
const certServiceController = require('../controllers/certService.controller');

// Public routes - for users
router.get('/active', certServiceController.getActiveCertServices);
router.get('/featured', certServiceController.getActiveCertServices); // with featured=true query
router.get('/options', certServiceController.getCertServiceOptions);
router.get('/:id', certServiceController.getCertServiceById);

// Admin routes - for content management
router.get('/', certServiceController.getAllCertServices);
router.get('/stats/overview', certServiceController.getCertServiceStats);
router.post('/', certServiceController.createCertService);
router.put('/:id', certServiceController.updateCertService);
router.delete('/:id', certServiceController.deleteCertService);
router.patch('/:id/toggle-status', certServiceController.toggleCertServiceStatus);
router.patch('/:id/toggle-featured', certServiceController.toggleCertServiceFeatured);

module.exports = router;
