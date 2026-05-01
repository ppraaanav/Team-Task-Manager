const { body, param } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');

exports.createRules = [
  body('name').trim().notEmpty().withMessage('Project name is required').isLength({ max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('members').optional().isArray().withMessage('Members must be an array'),
];

exports.updateMembersRules = [
  body('members').isArray().withMessage('Members must be an array of user IDs'),
];

exports.createProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: members || [],
    });

    const populated = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating project.' });
  }
};

exports.getProjects = async (req, res) => {
  try {
    let query;
    if (req.user.role === 'admin') {
      query = Project.find();
    } else {
      query = Project.find({
        $or: [{ owner: req.user._id }, { members: req.user._id }],
      });
    }

    const projects = await query
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching projects.' });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (
      req.user.role !== 'admin' &&
      project.owner._id.toString() !== req.user._id.toString() &&
      !project.members.some((m) => m._id.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Access denied to this project.' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching project.' });
  }
};

exports.updateMembers = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    project.members = req.body.members;
    await project.save();

    const populated = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating members.' });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    await Task.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(project._id);

    res.json({ message: 'Project and related tasks deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting project.' });
  }
};
