const { body } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');

exports.createRules = [
  body('title').trim().notEmpty().withMessage('Task title is required').isLength({ max: 150 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('status').optional().isIn(['todo', 'inprogress', 'done']),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
  body('assignedTo').optional().isMongoId().withMessage('Invalid user ID'),
  body('project').isMongoId().withMessage('Valid project ID is required'),
];

exports.updateRules = [
  body('title').optional().trim().notEmpty().isLength({ max: 150 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('status').optional().isIn(['todo', 'inprogress', 'done']),
  body('dueDate').optional().isISO8601(),
  body('assignedTo').optional().isMongoId(),
];

exports.createTask = async (req, res) => {
  try {
    const { title, description, status, dueDate, assignedTo, project: projectId } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (
      req.user.role !== 'admin' &&
      project.owner.toString() !== req.user._id.toString() &&
      !project.members.some((m) => m.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Access denied to this project.' });
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      dueDate,
      assignedTo,
      project: projectId,
      createdBy: req.user._id,
    });

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('project', 'name')
      .populate('createdBy', 'name');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating task.' });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const { project, status, assignedTo } = req.query;
    const filter = {};

    if (project) filter.project = project;
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;

    if (req.user.role !== 'admin') {
      const projects = await Project.find({
        $or: [{ owner: req.user._id }, { members: req.user._id }],
      }).select('_id');
      const projectIds = projects.map((p) => p._id);
      filter.project = filter.project
        ? { $in: [filter.project].filter((id) => projectIds.some((pid) => pid.toString() === id)) }
        : { $in: projectIds };
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('project', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching tasks.' });
  }
};

exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('project', 'name')
      .populate('createdBy', 'name');

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching task.' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const allowedFields = ['title', 'description', 'status', 'dueDate', 'assignedTo'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    await task.save();

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('project', 'name')
      .populate('createdBy', 'name');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating task.' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    await Task.findByIdAndDelete(task._id);
    res.json({ message: 'Task deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting task.' });
  }
};
