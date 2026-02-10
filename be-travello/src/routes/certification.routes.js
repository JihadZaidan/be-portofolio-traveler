const { Router } = require('express');
const {
  getAllCertifications,
  getCertificationById,
  createCertification,
  updateCertification,
  deleteCertification
} = require('../controllers/simple-certification.controller');

const router = Router();

// GET /api/certifications - Get all certifications
router.get('/', getAllCertifications);

// GET /api/certifications/:id - Get certification by ID
router.get('/:id', getCertificationById);

// POST /api/certifications - Create new certification
router.post('/', createCertification);

// PUT /api/certifications/:id - Update certification
router.put('/:id', updateCertification);

// DELETE /api/certifications/:id - Delete certification
router.delete('/:id', deleteCertification);

module.exports = router;
