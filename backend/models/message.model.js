const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true
    },
    recipient: { 
        type: mongoose.Schema.Types.ObjectId, 
        refPath: 'recipientType',
        required: true 
    },
    recipientType:{
        type: String,
        enum: ['User', 'Group'],
        default: 'User'
    },
    content: {
        type: String, 
        required: false 
    },
    attachment: {
        url: String,
        filename: String,
        mimeType: String,
        public_id: String,
        type:{
            type: String,
            enum: ['image', 'video', 'file', 'none'],
            default: 'none'
        }
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    },
});

module.exports = mongoose.model("Message", messageSchema);
