import { useState, useEffect } from 'react';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, statusLabel, statusColor, isOverdue } from '../utils/helpers';
import toast from 'react-hot-toast';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', project: '' });
  const [projects, setProjects] = useState([]);

  const fetchTasks = async () => {
    try {
      const params = {};
      if (filter.status) params.status = filter.status;
      if (filter.project) params.project = filter.project;
      const { data } = await API.get('/tasks', { params });
      setTasks(data);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    API.get('/projects').then(({ data }) => setProjects(data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchTasks();
  }, [filter]);

  const handleStatusChange = async (taskId, status) => {
    try {
      await API.put(`/tasks/${taskId}`, { status });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status } : t)));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await API.delete(`/tasks/${taskId}`);
      toast.success('Task deleted');
      fetchTasks();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">All Tasks</h2>
        <div className="flex gap-2">
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="inprogress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <select
            value={filter.project}
            onChange={(e) => setFilter({ ...filter, project: e.target.value })}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" />
      ) : tasks.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-4xl">✅</span>
          <p className="text-gray-500 mt-3">No tasks found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Task</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600 hidden sm:table-cell">Project</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600 hidden md:table-cell">Assigned</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600 hidden md:table-cell">Due</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tasks.map((task) => (
                  <tr
                    key={task._id}
                    className={`hover:bg-gray-50 ${isOverdue(task.dueDate, task.status) ? 'bg-red-50/50' : ''}`}
                  >
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-gray-400 truncate max-w-[200px]">{task.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-600 hidden sm:table-cell">{task.project?.name}</td>
                    <td className="px-5 py-3 text-gray-600 hidden md:table-cell">{task.assignedTo?.name || '—'}</td>
                    <td className={`px-5 py-3 hidden md:table-cell ${isOverdue(task.dueDate, task.status) ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                      {formatDate(task.dueDate)}
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        className={`text-xs font-medium rounded-full px-2 py-1 border-0 ${statusColor(task.status)}`}
                      >
                        <option value="todo">To Do</option>
                        <option value="inprogress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleDelete(task._id)}
                        className="text-gray-400 hover:text-red-500 text-sm"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
