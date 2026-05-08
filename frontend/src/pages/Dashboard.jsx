import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const getAvatarColor = (name) => {
  const colors = ['#6366f1', '#ec4899', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6'];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
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
      fetchTasks(); // refresh to show updated status
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;

  const todo = tasks.filter(t => t.status === 'PENDING').length;
  const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const done = tasks.filter(t => t.status === 'DONE' || t.status === 'COMPLETED').length;
  const overdue = tasks.filter(t => t.status === 'OVERDUE' || (t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE' && t.status !== 'COMPLETED')).length;

  return (
    <div>
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
      </div>

      <div className="dashboard-stats">
        <div className="glass-card stat-card" onClick={() => setFilter('ALL')} style={{ cursor: 'pointer', borderTopColor: filter === 'ALL' ? 'var(--primary-color)' : 'var(--border-color)' }}>
          <div className="stat-value">{tasks.length}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="glass-card stat-card" onClick={() => setFilter('PENDING')} style={{ cursor: 'pointer', borderTopColor: filter === 'PENDING' ? 'var(--primary-color)' : 'var(--border-color)' }}>
          <div className="stat-value">{todo}</div>
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
        {filter === 'ALL' ? 'Assigned & Recent Tasks' : `${filter.replace('_', ' ')} Tasks`}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="avatar" style={{ background: getAvatarColor(task.project?.name || 'P') }}>
                  {task.project?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ marginBottom: '4px' }}>{task.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Project: {task.projectId ? <Link to={`/projects/${task.projectId}`}>{task.project?.name}</Link> : 'N/A'} • Priority: {task.priority}
                    {task.dueDate && ` • Due: ${new Date(task.dueDate).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {/* If assigned to the user or Admin, show dropdown, else show badge */}
                {(task.assigneeId === user.id || user.role === 'ADMIN') ? (
                  <select 
                    className="form-control" 
                    style={{ width: 'auto', padding: '5px' }}
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                ) : (
                  <span className={`badge badge-${task.status.toLowerCase().replace('_', '-')}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
