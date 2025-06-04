const express = require('express');
const auth = require('../middleware/authMiddleware.js');
const { createGroup, getGroups } = require('../controllers/groupController.js');
const router = express.Router();

router.post('/', auth, createGroup);
router.get('/', auth, getGroups);

module.exports = router;