const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validate = require('../middleware/validate');
const {
  createProject,
  getProjects,
  getProject,
  updateMembers,
  deleteProject,
  createRules,
  updateMembersRules,
} = require('../controllers/projectController');

router.use(auth);

router.post('/', roleCheck('admin'), createRules, validate, createProject);
router.get('/', getProjects);
router.get('/:id', getProject);
router.put('/:id/members', roleCheck('admin'), updateMembersRules, validate, updateMembers);
router.delete('/:id', roleCheck('admin'), deleteProject);

module.exports = router;
