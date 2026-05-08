import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const getAvatarColor = (name) => {
  const colors = ['#6366f1', '#ec4899', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6'];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  
  // Modals
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  
  // Forms
  const [memberEmail, setMemberEmail] = useState('');
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'MEDIUM', assigneeId: '', dueDate: '' });

  // Filter
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchProject();
    fetchActivities();
  }, [id]);

  const fetchActivities = async () => {
    try {
      const response = await api.get(`/projects/${id}/activities`);
      setActivities(response.data);
    } catch (err) {
      console.error('Failed to fetch activities', err);
    }
  };

  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      setProject(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/members`, { email: memberEmail, role: 'MEMBER' });
      setShowMemberModal(false);
      setMemberEmail('');
      fetchProject();
    } catch (err) {
      alert('Failed to add member: ' + (err.response?.data?.error || 'Unknown error'));
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newTask, projectId: parseInt(id) };
      if (payload.assigneeId) payload.assigneeId = parseInt(payload.assigneeId);
      else delete payload.assigneeId;

      await api.post(`/tasks`, payload);
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', priority: 'MEDIUM', assigneeId: '', dueDate: '' });
      fetchProject();
    } catch (err) {
      alert('Failed to create task: ' + (err.response?.data?.error || 'Unknown error'));
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchProject();
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchProject();
      fetchActivities();
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to completely delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      navigate('/projects');
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!project) return <div>Project not found.</div>;

  // Stats calculation
  const totalTasks = project.tasks.length;
  const todo = project.tasks.filter(t => t.status === 'PENDING').length;
  const inProgress = project.tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const done = project.tasks.filter(t => t.status === 'DONE' || t.status === 'COMPLETED').length;
  const overdue = project.tasks.filter(t => t.status === 'OVERDUE' || (t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE' && t.status !== 'COMPLETED')).length;

  return (
    <div>
      <div className="dashboard-header" style={{ marginBottom: '10px' }}>
        <h1>{project.name} Dashboard</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          {user?.role === 'ADMIN' && (
            <>
              <button className="btn btn-secondary" onClick={() => setShowMemberModal(true)}>Add Member</button>
              <button className="btn btn-secondary" onClick={handleDeleteProject} style={{ color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}>Delete Project</button>
            </>
          )}
          <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>Create Task</button>
        </div>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>{project.description}</p>

      {/* Progress Bar */}
      <div style={{ marginBottom: '40px', maxWidth: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
          <span>Overall Completion</span>
          <span>{totalTasks > 0 ? Math.round((done / totalTasks) * 100) : 0}%</span>
        </div>
        <div className="progress-container" style={{ height: '12px' }}>
          <div className="progress-bar" style={{ width: `${totalTasks > 0 ? (done / totalTasks) * 100 : 0}%` }}></div>
        </div>
      </div>

      {/* Per-Project Dashboard Stats */}
      <div className="dashboard-stats">
        <div className="glass-card stat-card" onClick={() => setFilter('ALL')} style={{ cursor: 'pointer', borderTopColor: filter === 'ALL' ? 'var(--primary-color)' : 'var(--border-color)' }}>
          <div className="stat-value">{totalTasks}</div>
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

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginTop: '30px' }}>
        <div>
          <h2>Tasks</h2>
          {project.tasks.length === 0 ? <p style={{ marginTop: '10px' }}>No tasks yet.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              {project.tasks.filter(t => {
                if (filter === 'ALL') return true;
                if (filter === 'OVERDUE') return t.status === 'OVERDUE' || (t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE' && t.status !== 'COMPLETED');
                if (filter === 'PENDING') return t.status === 'PENDING';
                if (filter === 'DONE') return t.status === 'DONE' || t.status === 'COMPLETED';
                return t.status === filter;
              }).map(task => {
                const assignee = project.members.find(m => m.userId === task.assigneeId)?.user;
                return (
                  <div key={task.id} className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <h4 style={{ marginBottom: '4px' }}>{task.title}</h4>
                      <span className={`badge badge-${task.status.toLowerCase().replace('_', '-')}`}>{task.status.replace('_', ' ')}</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>{task.description}</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                      <div>
                        <span>Priority: <strong>{task.priority}</strong> • Assigned: {assignee ? assignee.name : 'Unassigned'}</span>
                        {task.dueDate && (
                          <div style={{ marginTop: '5px', color: 'var(--danger-color)' }}>
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {(task.assigneeId === user.id || user.role === 'ADMIN') && (
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
                        )}
                        {user?.role === 'ADMIN' && (
                          <button onClick={() => handleDeleteTask(task.id)} className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>Delete</button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div>
          <h2>Team Members</h2>
          <ul style={{ marginTop: '10px', listStyleType: 'none' }}>
            {project.members.map(member => (
              <li key={member.id} className="glass-card" style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="avatar" style={{ background: getAvatarColor(member.user.name) }}>
                  {member.user.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{member.user.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{member.role.toLowerCase()}</div>
                </div>
              </li>
            ))}
          </ul>

          <h2 style={{ marginTop: '40px' }}>Recent Activity</h2>
          <div className="glass-panel activity-list" style={{ padding: '20px' }}>
            {activities.length === 0 ? <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No activity yet.</p> : (
              activities.map(act => (
                <div key={act.id} className="activity-item">
                  <strong>{act.user.name}</strong> {act.content}
                  <span className="activity-time">{new Date(act.createdAt).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="modal-overlay">
          <div className="glass-panel" style={{ width: '400px' }}>
            <h2>Add Team Member</h2>
            <form onSubmit={handleAddMember} style={{ marginTop: '15px' }}>
              <div className="form-group">
                <label>User Email</label>
                <input type="email" className="form-control" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowMemberModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay">
          <div className="glass-panel" style={{ width: '500px' }}>
            <h2>Create Task</h2>
            <form onSubmit={handleCreateTask} style={{ marginTop: '15px' }}>
              <div className="form-group">
                <label>Task Title</label>
                <input type="text" className="form-control" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})}></textarea>
              </div>
              <div className="form-group" style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label>Priority</label>
                  <select className="form-control" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label>Due Date</label>
                  <input type="date" className="form-control" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Assign To</label>
                <select className="form-control" value={newTask.assigneeId} onChange={e => setNewTask({...newTask, assigneeId: e.target.value})}>
                  <option value="">-- Unassigned --</option>
                  {project.members.map(m => (
                    <option key={m.id} value={m.userId}>{m.user.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
