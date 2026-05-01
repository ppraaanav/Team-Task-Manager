import { useState, useEffect } from 'react';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, isOverdue, statusLabel, statusColor } from '../utils/helpers';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await API.get('/dashboard');
        setData(data);
      } catch (err) {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;
  if (!data) return <p className="text-center text-gray-500 py-12">Failed to load dashboard.</p>;

  const { stats, recentTasks, overdueTasks } = data;

  const statCards = [
    { label: 'Total Tasks', value: stats.total, color: 'bg-indigo-500' },
    { label: 'Completed', value: stats.completed, color: 'bg-green-500' },
    { label: 'In Progress', value: stats.inprogress, color: 'bg-blue-500' },
    { label: 'To Do', value: stats.todo, color: 'bg-yellow-500' },
    { label: 'Overdue', value: stats.overdue, color: 'bg-red-500' },
    { label: 'Projects', value: stats.projectCount, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className={`inline-block w-3 h-3 rounded-full ${s.color} mb-2`} />
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-red-800 mb-3">⚠️ Overdue Tasks</h3>
          <div className="space-y-2">
            {overdueTasks.map((task) => (
              <div key={task._id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-red-100">
                <div>
                  <p className="font-medium text-gray-900">{task.title}</p>
                  <p className="text-xs text-gray-500">
                    {task.project?.name} • Due: {formatDate(task.dueDate)}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(task.status)}`}>
                  {statusLabel(task.status)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Tasks */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Tasks</h3>
        </div>
        {recentTasks.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No tasks yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentTasks.map((task) => (
              <div
                key={task._id}
                className={`flex items-center justify-between px-5 py-3 hover:bg-gray-50 ${
                  isOverdue(task.dueDate, task.status) ? 'bg-red-50/50' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{task.title}</p>
                  <p className="text-xs text-gray-500">
                    {task.project?.name}
                    {task.assignedTo && ` • ${task.assignedTo.name}`}
                    {task.dueDate && ` • ${formatDate(task.dueDate)}`}
                  </p>
                </div>
                <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusColor(task.status)}`}>
                  {statusLabel(task.status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
