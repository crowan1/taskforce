import React, { useState, useEffect } from 'react';
import { dashboardServices } from '../../services/dashboard/dashboardServices';
import '../../assets/styles/compenents/MyAccount/UserTasksManager.scss';

const UserTasksManager = () => {
    const [assignedTasks, setAssignedTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedProjects, setExpandedProjects] = useState({});

    useEffect(() => {
        fetchAssignedTasks();
    }, []);

    const fetchAssignedTasks = async () => {
        try {
            setLoading(true);
            const response = await dashboardServices.getTasks();
            const tasks = response.tasks || [];
            const assigned = tasks.filter(task => task.assignedTo);
            setAssignedTasks(assigned);
            
            // open first project
            if (assigned.length > 0) {
                const firstProjectId = assigned[0].project?.id;
                if (firstProjectId) {
                    setExpandedProjects({ [firstProjectId]: true });
                }
            }
        } catch (err) {
            setError('Erreur lors du chargement des tâches assignées');
        } finally {
            setLoading(false);
        }
    };

    const toggleProject = (projectId) => {
        setExpandedProjects(prev => ({
            ...prev,
            [projectId]: !prev[projectId]
        }));
    };

    const groupTasksByProject = () => {
        const grouped = {};
        assignedTasks.forEach(task => {
            const projectId = task.project?.id || 'unknown';
            const projectName = task.project?.name || 'Projet inconnu';
            
            if (!grouped[projectId]) {
                grouped[projectId] = {
                    name: projectName,
                    tasks: []
                };
            }
            grouped[projectId].tasks.push(task);
        });
        return grouped;
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#dc3545';
            case 'medium': return '#ffc107';
            case 'low': return '#28a745';
            default: return '#6c757d';
        }
    };

    const getPriorityLabel = (priority) => {
        switch (priority) {
            case 'high': return 'Haute';
            case 'medium': return 'Moyenne';
            case 'low': return 'Basse';
            default: return 'Non définie';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'todo': return '#6c757d';
            case 'en-cours': return '#007bff';
            case 'done': return '#28a745';
            default: return '#6c757d';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'todo': return 'À faire';
            case 'en-cours': return 'En cours';
            case 'done': return 'Terminée';
            default: return 'Non définie';
        }
    };

    if (loading) {
        return (
            <div className="user-tasks-manager">
                <div className="loading-spinner"></div>
                <p>Chargement des tâches assignées...</p>
            </div>
        );
    }

    const groupedTasks = groupTasksByProject();
    const totalTasks = assignedTasks.length;

    return (
        <div className="user-tasks-manager">
            <div className="tasks-header">
                <h3>Mes Tâches Assignées</h3>
                <span className="task-count">{totalTasks} tâche(s)</span>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            {assignedTasks.length === 0 ? (
                <div className="no-tasks">
                    <p>Aucune tâche ne vous a été assignée pour le moment.</p>
                    <p>Les tâches vous seront automatiquement attribuées</p>
                    <p>Ca va arriver bientôt !!! </p>
                </div>
            ) : (
                <div className="projects-list">
                    {Object.entries(groupedTasks).map(([projectId, project]) => (
                        <div key={projectId} className="project-group">
                            <div 
                                className="project-header"
                                onClick={() => toggleProject(projectId)}
                            >
                                <div className="project-info">
                                    <h4 className="project-name">{project.name}</h4>
                                    <span className="project-task-count">
                                        {project.tasks.length} tâche(s)
                                    </span>
                                </div>
                                <div className="project-toggle">
                                    <span className={`arrow ${expandedProjects[projectId] ? 'expanded' : ''}`}>
                                        ▼
                                    </span>
                                </div>
                            </div>
                            
                            {expandedProjects[projectId] && (
                                <div className="project-tasks">
                                    {project.tasks.map(task => (
                                        <div key={task.id} className="task-item">
                                            <div className="task-header">
                                                <h5 className="task-title">{task.title}</h5>
                                                <div className="task-meta">
                                                    <span 
                                                        className="priority-badge"
                                                        style={{ backgroundColor: getPriorityColor(task.priority) }}
                                                    >
                                                        {getPriorityLabel(task.priority)}
                                                    </span>
                                                    <span 
                                                        className="priority-badge"
                                                        style={{ backgroundColor: getStatusColor(task.status) }}
                                                    >
                                                        {getStatusLabel(task.status)}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {task.description && (
                                                <p className="task-description">{task.description}</p>
                                            )}
                                            
                                            <div className="task-details">
                                                {task.requiredSkills && task.requiredSkills.length > 0 && (
                                                    <div className="task-skills">
                                                        <strong>Compétences requises :</strong>
                                                        <div className="skills-list">
                                                            {task.requiredSkills.map(skill => (
                                                                <span key={skill.id} className="skill-badge">
                                                                    {skill.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <div className="task-dates">
                                                    <div className="date-item">
                                                        <strong>Créée le :</strong> {new Date(task.createdAt).toLocaleDateString('fr-FR')}
                                                    </div>
                                                    {task.assignedAt && (
                                                        <div className="date-item">
                                                            <strong>Assignée le :</strong> {new Date(task.assignedAt).toLocaleDateString('fr-FR')}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserTasksManager;
