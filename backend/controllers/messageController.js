const Message = require('../models/message.model.js');

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

module.exports = {
    getMessages,
    sendMessage
};