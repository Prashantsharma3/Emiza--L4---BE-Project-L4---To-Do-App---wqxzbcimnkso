const Users = require("../models/user.js");
const jwt = require("jsonwebtoken");
const Tasks = require("../models/task.js");
const bcrypt = require('bcrypt');
const { valid } = require("joi");
const JWT_SECRET = "newtonSchool";

const createTask = async (req, res) => {
    // creator_id is the user id who created this task
    const { heading, description, token } = req.body;
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: 'Invalid token'
        });
    }
    const creator_id = decodedToken.userId;

    const newTask = {
        heading,
        description,
        creator_id
    };

    try {
        const task = await Tasks.create(newTask);
        res.status(200).json({
            message: 'Task added successfully',
            task_id: task._id,
            status: 'success'
        });
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error.message
        });
    };
}

const getdetailTask = async (req, res) => {
    const task_id = req.body.task_id;
    try {
        const task = await Tasks.findById(task_id);
        res.status(200).json({
            status: 'success',
            data: task
        })
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err.message
        })
    }
}

const updateTask = async (req, res) => {
    const task_id = req.body.task_id;
    try {
        const task = await Tasks.findByIdAndUpdate(
            task_id,
            { $set: req.body },
            { new: true }
        );
        res.status(200).json({
            status: 'success',
            data: task
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            data: err.message
        });
    }
}

const deleteTask = async (req, res) => {
    const { task_id, token } = req.body;
    try {
        await Tasks.findByIdAndDelete(task_id);
        res.status(200).json({
            status: 'success',
            message: 'Task deleted successfully'
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err.message
        })
    }
};

const getallTask = async (req, res) => {
    const { token } = req.body;
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: 'Invalid token'
        });
    }

    const userId = decodedToken.userId;
    const user = await Users.findById(userId);

    let tasks;

    if (user.role === 'admin') {
        tasks = await Tasks.find().sort({ createdAt: -1 });
    } else {
        tasks = await Tasks.find({ creator_id: userId }).sort({ createdAt: -1 });
    }

    res.status(200).json({
        status: 'success',
        data: tasks
    });
};

module.exports = { createTask, getdetailTask, updateTask, deleteTask, getallTask };
