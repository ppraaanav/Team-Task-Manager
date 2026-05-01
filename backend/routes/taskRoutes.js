const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  createRules,
  updateRules,
} = require('../controllers/taskController');

router.use(auth);

router.post('/', createRules, validate, createTask);
router.get('/', getTasks);
router.get('/:id', getTask);
router.put('/:id', updateRules, validate, updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
