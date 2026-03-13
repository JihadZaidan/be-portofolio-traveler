const express = require('express');
const { upload, getById } = require('../controllers/media.controller');

const router = express.Router();

router.post('/', upload);
router.get('/:id', getById);

module.exports = router;
