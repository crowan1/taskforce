import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../compenents/includes/header';
import Footer from '../compenents/includes/footer';
import KanbanBoard from '../compenents/dashboard/KanbanBoard';
import CreateTaskModal from '../compenents/dashboard/CreateTaskModal';
import CreateProjectModal from '../compenents/dashboard/CreateProjectModal';
import '../assets/styles/Dashboard.scss';

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [showCreateProject, setShowCreateProject] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        if (selectedProject) {
            fetchTasks(selectedProject.id);
        }
    }, [selectedProject]);

    const fetchProjects = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch('http://localhost:8000/api/projects', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors du chargement des projets');
            }

            const data = await response.json();
            setProjects(data.projects);
            
            if (data.projects.length > 0) {
                setSelectedProject(data.projects[0]);
            }
            
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const fetchTasks = async (projectId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8000/api/tasks?projectId=${projectId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors du chargement des tâches');
            }

            const data = await response.json();
            setTasks(data.tasks);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCreateTask = async (taskData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/tasks', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...taskData,
                    projectId: selectedProject.id
                })
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la création de la tâche');
            }

            const data = await response.json();
            setTasks(prev => [...prev, data.task]);
            setShowCreateTask(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCreateProject = async (projectData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/projects', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(projectData)
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la création du projet');
            }

            const data = await response.json();
            setProjects(prev => [...prev, data.project]);
            setSelectedProject(data.project);
            setShowCreateProject(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleUpdateTaskStatus = async (taskId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8000/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour de la tâche');
            }

            setTasks(prev => prev.map(task => 
                task.id === taskId ? { ...task, status: newStatus } : task
            ));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleShowDeleteModal = (task) => {
        console.log('handleShowDeleteModal called with task:', task);
        setTaskToDelete(task);
        setShowDeleteModal(true);
    };

    const handleDeleteTask = async (taskId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8000/api/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la suppression de la tâche');
            }

            setTasks(prev => prev.filter(task => task.id !== taskId));
            setShowDeleteModal(false);
            setTaskToDelete(null);
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <Header />
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Chargement du tableau...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-container">
                <Header />
                <div className="error-container">
                    <h2>Erreur</h2>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>
                        Réessayer
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <Header />
            
            <div className="dashboard-content">
                <div className="dashboard-header">
                    <div className="project-selector">
                        <h1>Tableau Kanban</h1>
                        <select 
                            value={selectedProject?.id || ''} 
                            onChange={(e) => {
                                const project = projects.find(p => p.id === parseInt(e.target.value));
                                setSelectedProject(project);
                            }}
                            className="project-select"
                        >
                            {projects.map(project => (
                                <option key={project.id} value={project.id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="dashboard-actions">
                        <button 
                            className="btn-create-project"
                            onClick={() => setShowCreateProject(true)}
                        >
                            + Nouveau Projet
                        </button>
                        <button 
                            className="btn-create-task"
                            onClick={() => setShowCreateTask(true)}
                            disabled={!selectedProject}
                        >
                            + Nouvelle Tâche
                        </button>
                    </div>
                </div>

                {selectedProject ? (
                    <KanbanBoard 
                        tasks={tasks}
                        onUpdateTaskStatus={handleUpdateTaskStatus}
                        onDeleteTask={handleDeleteTask}
                        onShowDeleteModal={handleShowDeleteModal}
                    />
                ) : (
                    <div className="no-project">
                        <h2>Aucun projet sélectionné</h2>
                        <p>Créez votre projet </p>
                        <button 
                            className="btn-create-project"
                            onClick={() => setShowCreateProject(true)}
                        >
                            Créer un projet
                        </button>
                    </div>
                )}
            </div>

            {showCreateTask && (
                <CreateTaskModal 
                    onClose={() => setShowCreateTask(false)}
                    onCreateTask={handleCreateTask}
                    project={selectedProject}
                />
            )}

            {showCreateProject && (
                <CreateProjectModal 
                    onClose={() => setShowCreateProject(false)}
                    onCreateProject={handleCreateProject}
                />
            )}

            {showDeleteModal && taskToDelete && (
Delete button clicked for task: {id: 3, title: 'fdgf', description: 'dgdfgfdgf', status: 'backlog', priority: 'medium', …}
Dashboard.jsx:163 handleShowDeleteModal called with task: {id: 3, title: 'fdgf', description: 'dgdfgfdgf', status: 'backlog', priority: 'medium', …}                <div className="delete-modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="delete-modal-header">
                            <h3>Confirmer la suppression</h3>
                            <button 
                                className="btn-close"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="delete-modal-body">
                            <p>Êtes-vous sûr de vouloir supprimer la tâche :</p>
                            <p className="task-title-confirm">"{taskToDelete.title}" ?</p>
                            <p className="delete-warning">Cette action est irréversible.</p>
                        </div>
                        <div className="delete-modal-actions">
                            <button 
                                className="btn-cancel"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Annuler
                            </button>
                            <button 
                                className="btn-confirm-delete"
                                onClick={() => handleDeleteTask(taskToDelete.id)}
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default Dashboard;