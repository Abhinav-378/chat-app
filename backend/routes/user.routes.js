const express = require('express');
const User = require('../models/user.model.js');
const auth = require('../middleware/authMiddleware.js')
const mongoose = require('mongoose');

const router = express.Router();

router.get('/', auth, async (req, res) => {
    try{
        // console.log("Fetching all users except the current user:", req.user);
        const users = await User.find({ 
            _id: { $ne: new mongoose.Types.ObjectId(req.user._id) }
        }).select('-password');
        
        // console.log("Found users:", users);
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;