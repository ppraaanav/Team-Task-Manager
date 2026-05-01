const Task = require('../models/Task');
const Project = require('../models/Project');

exports.getDashboard = async (req, res) => {
  try {
    let projectFilter;
    if (req.user.role === 'admin') {
      projectFilter = {};
    } else {
      const projects = await Project.find({
        $or: [{ owner: req.user._id }, { members: req.user._id }],
      }).select('_id');
      projectFilter = { project: { $in: projects.map((p) => p._id) } };
    }

    const allTasks = await Task.find(projectFilter);
    const now = new Date();

    const total = allTasks.length;
    const completed = allTasks.filter((t) => t.status === 'done').length;
    const inprogress = allTasks.filter((t) => t.status === 'inprogress').length;
    const todo = allTasks.filter((t) => t.status === 'todo').length;
    const overdue = allTasks.filter(
      (t) => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < now
    ).length;

    const recentTasks = await Task.find(projectFilter)
      .populate('assignedTo', 'name email')
      .populate('project', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    const overdueTasks = await Task.find({
      ...projectFilter,
      status: { $ne: 'done' },
      dueDate: { $lt: now },
    })
      .populate('assignedTo', 'name email')
      .populate('project', 'name')
      .sort({ dueDate: 1 });

    let projectCount;
    if (req.user.role === 'admin') {
      projectCount = await Project.countDocuments();
    } else {
      projectCount = await Project.countDocuments({
        $or: [{ owner: req.user._id }, { members: req.user._id }],
      });
    }

    res.json({
      stats: { total, completed, inprogress, todo, overdue, projectCount },
      recentTasks,
      overdueTasks,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching dashboard.' });
  }
};
