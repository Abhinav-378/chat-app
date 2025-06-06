const express = require('express');
const auth = require('../middleware/authMiddleware.js');
const { getMessages, sendMessage, getGroupMessages, sendFileMessage } = require('../controllers/messageController.js');
const { upload } = require('../middleware/multerMiddleware.js');
const router = express.Router();

router.post('/upload', auth, upload.single('file'), sendFileMessage);
router.get('/groups/:groupId', auth, getGroupMessages); 
router.get('/:userId', auth, getMessages);
router.post('/', auth, sendMessage);

module.exports = router;