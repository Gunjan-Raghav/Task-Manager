import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const AdminDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      // Admins get all tasks across all projects
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;

  if (user?.role !== 'ADMIN') {
    return <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>Access Denied: Admins Only</div>;
  }

  const pending = tasks.filter(t => t.status === 'PENDING').length;
  const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const done = tasks.filter(t => t.status === 'DONE' || t.status === 'COMPLETED').length;
  const overdue = tasks.filter(t => t.status === 'OVERDUE' || (t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE' && t.status !== 'COMPLETED')).length;

  return (
    <div>
      <div className="dashboard-header">
        <h1>Global Admin Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Overview of all tasks across all projects</p>
      </div>

      <div className="dashboard-stats">
        <div className="glass-card stat-card" onClick={() => setFilter('ALL')} style={{ cursor: 'pointer', borderTopColor: filter === 'ALL' ? 'var(--primary-color)' : 'var(--border-color)' }}>
          <div className="stat-value">{tasks.length}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="glass-card stat-card" onClick={() => setFilter('PENDING')} style={{ cursor: 'pointer', borderTopColor: filter === 'PENDING' ? 'var(--primary-color)' : 'var(--border-color)' }}>
          <div className="stat-value">{pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="glass-card stat-card" onClick={() => setFilter('IN_PROGRESS')} style={{ cursor: 'pointer', borderTopColor: filter === 'IN_PROGRESS' ? 'var(--primary-color)' : 'var(--border-color)' }}>
          <div className="stat-value">{inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="glass-card stat-card" onClick={() => setFilter('DONE')} style={{ cursor: 'pointer', borderTopColor: filter === 'DONE' ? 'var(--success-color)' : 'var(--border-color)' }}>
          <div className="stat-value">{done}</div>
          <div className="stat-label">Done</div>
        </div>
        <div className="glass-card stat-card" onClick={() => setFilter('OVERDUE')} style={{ cursor: 'pointer', borderTopColor: filter === 'OVERDUE' ? 'var(--danger-color)' : 'var(--border-color)' }}>
          <div className="stat-value">{overdue}</div>
          <div className="stat-label">Overdue</div>
        </div>
      </div>

      <h2 style={{ marginBottom: '24px' }}>
        {filter === 'ALL' ? 'All Tasks' : `${filter.replace('_', ' ')} Tasks`}
      </h2>
      <div style={{ display: 'grid', gap: '16px' }}>
        {tasks.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No tasks found.</p>
        ) : (
          tasks.filter(t => {
            if (filter === 'ALL') return true;
            if (filter === 'OVERDUE') return t.status === 'OVERDUE' || (t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE' && t.status !== 'COMPLETED');
            if (filter === 'PENDING') return t.status === 'PENDING';
            if (filter === 'DONE') return t.status === 'DONE' || t.status === 'COMPLETED';
            return t.status === filter;
          }).map(task => (
            <div key={task.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ marginBottom: '4px' }}>{task.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Project: {task.projectId ? <Link to={`/projects/${task.projectId}`}>{task.project?.name}</Link> : 'N/A'} • Priority: {task.priority}
                  {task.dueDate && ` • Due: ${new Date(task.dueDate).toLocaleDateString()}`}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Assigned to: {task.assignee ? task.assignee.name : 'Unassigned'}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <select 
                  className="form-control" 
                  style={{ width: 'auto', padding: '5px' }}
                  value={task.status === 'TODO' ? 'PENDING' : (task.status === 'COMPLETED' ? 'DONE' : task.status)}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
                <button onClick={() => handleDeleteTask(task.id)} className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
