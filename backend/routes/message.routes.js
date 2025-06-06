const express = require('express');
const auth = require('../middleware/authMiddleware.js');
const { getMessages, sendMessage, getGroupMessages } = require('../controllers/messageController.js');

const router = express.Router();

router.get('/groups/:groupId', auth, getGroupMessages); 
router.get('/:userId', auth, getMessages);
router.post('/', auth, sendMessage);

module.exports = router;