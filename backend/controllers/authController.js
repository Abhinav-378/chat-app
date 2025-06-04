const User = require('../models/user.model.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { username, password } = req.body;
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({
            username,
            password: hashedPassword
        });
        await user.save();
        const token = jwt.sign({ _id: user._id, username: username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({
            token, user
        })
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ _id: user._id, username: username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({
            token, user
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    register,
    login
};
