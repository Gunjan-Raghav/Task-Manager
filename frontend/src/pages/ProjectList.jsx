import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const getAvatarColor = (name) => {
  const colors = ['#6366f1', '#ec4899', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6'];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      setShowModal(false);
      setNewProject({ name: '', description: '' });
      fetchProjects();
    } catch (err) {
      alert('Failed to create project: ' + (err.response?.data?.error || 'Unknown error'));
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <h1>Projects</h1>
        {user?.role === 'ADMIN' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + New Project
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading projects...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {projects.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No projects found.</p>
          ) : (
            projects.map(project => (
              <Link to={`/projects/${project.id}`} key={project.id} className="glass-card" style={{ display: 'block' }}>
                <h3 style={{ marginBottom: '8px', fontSize: '1.25rem' }}>{project.name}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.9rem' }}>
                  {project.description || 'No description provided.'}
                </p>
                
                {/* Progress Bar */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                    <span>Progress</span>
                    <span>{project._count?.tasks > 0 ? Math.round((project.doneTasksCount / project._count.tasks) * 100) : 0}%</span>
                  </div>
                  <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${project._count?.tasks > 0 ? (project.doneTasksCount / project._count.tasks) * 100 : 0}%` }}></div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span>👥 {project._count?.members || 0}</span>
                    <span>📝 {project._count?.tasks || 0}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="avatar" style={{ background: getAvatarColor(project.owner?.name || 'A'), width: '24px', height: '24px', fontSize: '0.6rem' }}>
                      {project.owner?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span>{project.owner?.name}</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px' }}>
            <h2 style={{ marginBottom: '24px' }}>Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label>Project Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={newProject.name} 
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  className="form-control" 
                  rows="3"
                  value={newProject.description} 
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})} 
                ></textarea>
              </div>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
