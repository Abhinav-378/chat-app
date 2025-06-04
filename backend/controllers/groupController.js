const Group = require('../models/group.model.js');

const createGroup = async (req, res) => {
    try {
        const group = new Group({
            name: req.body.name,
            members: [...req.body.members, req.user._id],
            admin: req.user._id
        });
        await group.save();
        res.status(201).json(group);
    } catch (error) {
        req.status(500).json({ message: error.message });
    }
}

const getGroups = async (req, res) => {
    try {
        const groups = await Group.find({ members: req.user._id })
            .populate('members', '-password')
            .populate('admin', '-password');
        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    createGroup,
    getGroups
};