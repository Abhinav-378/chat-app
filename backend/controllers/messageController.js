const Message = require('../models/message.model.js');
const { uploadOnCloudinary } = require('../utils/cloudinary.js');
const getMessages = async (req, res) => {
    try{
        const { userId } = req.params;
        const messages = await Message.find({
            $or: [
                { sender: userId, recipient: req.user._id },
                { sender: req.user._id, recipient: userId }
            ]
        }).sort({timestamp:1})
        res.json(messages);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const messages = await Message.find({ recipient: groupId })
        .populate('sender', 'username')
            .sort({ timestamp: 1 });
        res.json(messages);
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const sendMessage = async (req, res) => {
    try {
        const { recipient, content } = req.body;
        const message = new Message({
            sender: req.user._id,
            recipient,
            content
        });
        await message.save();
        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const sendFileMessage = async (req, res) => {
    console.log("File upload request received:", req);
    try{
        if(!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const cloudinaryRes = await uploadOnCloudinary(req.file.path);

        if(!cloudinaryRes) {
            return res.status(500).json({ message: 'Failed to upload file' });
        }
        console.log("File uploaded to Cloudinary:", cloudinaryRes);
        const { recipient, recipientType = 'User' } = req.body;

         const fileType = req.file.mimetype.startsWith('image/') ? 'image' :
                        req.file.mimetype.startsWith('video/') ? 'video' : 'file';

        const message = new Message({
            sender: req.user._id,
            recipient,
            recipientType,
            content: req.body.content || '',
            attachment: {
                url: cloudinaryRes.secure_url,
                public_id: cloudinaryRes.public_id,
                filename: req.file.originalname,
                mimetype: req.file.mimetype,
                type: fileType
            }
        });

        await message.save();
        const populatedMessage = await message.populate('sender', 'username');
        const io = req.app.get('io');
        if (recipientType === 'Group') {
            io.to(`group:${recipient}`).emit('newGroupMessage', populatedMessage);
        } else {
            io.to(recipient).emit('private_message', populatedMessage);
        }
        res.status(201).json(populatedMessage);
    }
    catch (error) {
        console.error("Error sending file message:", error);
        res.status(500).json({ message: error.message });      
    }
}

module.exports = {
    getMessages,
    sendMessage,
    getGroupMessages,
    sendFileMessage
};