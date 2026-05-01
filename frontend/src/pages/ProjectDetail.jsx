import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, statusLabel, statusColor, isOverdue } from '../utils/helpers';
import toast from 'react-hot-toast';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberIds, setMemberIds] = useState([]);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', dueDate: '', assignedTo: '', status: 'todo' });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        API.get(`/projects/${id}`),
        API.get(`/tasks?project=${id}`),
      ]);
      setProject(projRes.data);
      setTasks(taskRes.data);
      setMemberIds(projRes.data.members?.map((m) => m._id) || []);
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error('Project not found');
        navigate('/projects');
      } else {
        toast.error('Failed to load project');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await API.get('/auth/users');
      setUsers(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchData();
    fetchUsers();
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...taskForm, project: id };
      if (!payload.assignedTo) delete payload.assignedTo;
      if (!payload.dueDate) delete payload.dueDate;
      await API.post('/tasks', payload);
      toast.success('Task created');
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', dueDate: '', assignedTo: '', status: 'todo' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await API.put(`/tasks/${taskId}`, { status });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status } : t)));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await API.delete(`/tasks/${taskId}`);
      toast.success('Task deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleUpdateMembers = async () => {
    try {
      await API.put(`/projects/${id}/members`, { members: memberIds });
      toast.success('Members updated');
      setShowMemberModal(false);
      fetchData();
    } catch {
      toast.error('Failed to update members');
    }
  };

  const toggleMemberId = (userId) => {
    setMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((x) => x !== userId) : [...prev, userId]
    );
  };

  if (loading) return <LoadingSpinner size="lg" />;
  if (!project) return null;

  const projectMembers = [...(project.members || []), project.owner].filter(
    (v, i, a) => a.findIndex((t) => t._id === v._id) === i
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button onClick={() => navigate('/projects')} className="text-sm text-indigo-600 hover:underline mb-1">
            ← Back to Projects
          </button>
          <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
          {project.description && <p className="text-gray-500 mt-1">{project.description}</p>}
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <button
              onClick={() => setShowMemberModal(true)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Manage Members
            </button>
          )}
          <button
            onClick={() => setShowTaskModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
          >
            + New Task
          </button>
        </div>
      </div>

      {/* Members */}
      <div className="flex flex-wrap gap-2">
        {projectMembers.map((m) => (
          <span key={m._id} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
            <span className="w-5 h-5 rounded-full bg-indigo-200 flex items-center justify-center text-[10px] font-bold">
              {m.name?.charAt(0).toUpperCase()}
            </span>
            {m.name}
          </span>
        ))}
      </div>

      {/* Task Columns */}
      <div className="grid md:grid-cols-3 gap-4">
        {['todo', 'inprogress', 'done'].map((status) => {
          const filtered = tasks.filter((t) => t.status === status);
          return (
            <div key={status} className="bg-gray-100 rounded-xl p-4">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${status === 'todo' ? 'bg-yellow-400' : status === 'inprogress' ? 'bg-blue-400' : 'bg-green-400'}`} />
                {statusLabel(status)} ({filtered.length})
              </h3>
              <div className="space-y-2">
                {filtered.map((task) => (
                  <div
                    key={task._id}
                    className={`bg-white rounded-lg p-3 border shadow-sm ${
                      isOverdue(task.dueDate, task.status) ? 'border-red-300 bg-red-50/50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <p className="font-medium text-sm text-gray-900">{task.title}</p>
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="text-gray-300 hover:text-red-500 text-xs ml-2"
                      >
                        ✕
                      </button>
                    </div>
                    {task.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-xs text-gray-400 space-x-2">
                        {task.assignedTo && <span>{task.assignedTo.name}</span>}
                        {task.dueDate && (
                          <span className={isOverdue(task.dueDate, task.status) ? 'text-red-500 font-medium' : ''}>
                            {formatDate(task.dueDate)}
                          </span>
                        )}
                      </div>
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        className="text-xs border border-gray-200 rounded px-1 py-0.5 bg-white"
                      >
                        <option value="todo">To Do</option>
                        <option value="inprogress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">No tasks</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  >
                    <option value="todo">To Do</option>
                    <option value="inprogress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                <select
                  value={taskForm.assignedTo}
                  onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="">Unassigned</option>
                  {projectMembers.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowTaskModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                  {submitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Members Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Manage Members</h3>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
              {users.map((u) => (
                <label key={u._id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 rounded px-2 py-1">
                  <input
                    type="checkbox"
                    checked={memberIds.includes(u._id)}
                    onChange={() => toggleMemberId(u._id)}
                    className="rounded text-indigo-600"
                  />
                  {u.name} <span className="text-gray-400">({u.role})</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <button onClick={() => setShowMemberModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                Cancel
              </button>
              <button onClick={handleUpdateMembers} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
