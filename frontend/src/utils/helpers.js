import { format, isPast, isToday } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '—';
  return format(new Date(date), 'MMM dd, yyyy');
};

export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'done') return false;
  return isPast(new Date(dueDate)) && !isToday(new Date(dueDate));
};

export const statusLabel = (status) => {
  const map = { todo: 'To Do', inprogress: 'In Progress', done: 'Done' };
  return map[status] || status;
};

export const statusColor = (status) => {
  const map = {
    todo: 'bg-yellow-100 text-yellow-800',
    inprogress: 'bg-blue-100 text-blue-800',
    done: 'bg-green-100 text-green-800',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
};
