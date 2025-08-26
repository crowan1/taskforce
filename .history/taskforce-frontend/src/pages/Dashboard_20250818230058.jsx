import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../compenents/includes/header';
import Footer from '../compenents/includes/footer';
import KanbanBoard from '../compenents/dashboard/KanbanBoard';
import CreateTaskModal from '../compenents/dashboard/modal/CreateTaskModal';
import CreateProjectModal from '../compenents/dashboard/modal/CreateProjectModal';
import CreateColumnModal from '../compenents/dashboard/modal/CreateColumnModal';

import ManageUsersModal from '../compenents/dashboard/modal/ManageUsersModal';
import AddSkillsModal from '../compenents/dashboard/modal/AddSkillsModal';
import EditTaskModal from '../compenents/dashboard/modal/EditTaskModal';
import { dashboardServices } from '../services/dashboard/dashboardServices';


// styles
import '../assets/styles/compenents/Dashboard/CreateTaskProjectModal.scss';
import '../assets/styles/compenents/Dashboard/ModalDelete.scss';
import '../assets/styles/compenents/Dashboard/TaskCard.scss';
import '../assets/styles/Dashboard.scss';

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [columns, setColumns] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [showCreateProject, setShowCreateProject] = useState(false);
    const [showCreateColumn, setShowCreateColumn] = useState(false);

    const [showManageUsers, setShowManageUsers] = useState(false);
    const [showAddSkills, setShowAddSkills] = useState(false);
    const [showEditTask, setShowEditTask] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [currentUserRole, setCurrentUserRole] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();



    const fetchProjects = async () => {
        try {
            const data = await dashboardServices.getProjects();
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
            const data = await dashboardServices.getTasks(projectId);
            setTasks(data.tasks);
        } catch (err) {
            setError(err.message);
        }
    };

    const fetchColumns = async (projectId) => {
        try {
            const data = await dashboardServices.getColumns(projectId);
            setColumns(data.columns);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCreateTask = async (taskData) => {
        try {
            const data = await dashboardServices.createTask({ ...taskData, projectId: selectedProject.id });
            
            setTimeout(async () => {
                await fetchTasks(selectedProject.id);
            }, 500);
            
            setShowCreateTask(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCreateProject = async (projectData) => {
        try {
            const data = await dashboardServices.createProject(projectData);
            console.log('Projet créé:', data.project);
            setProjects(prev => [...prev, data.project]);
            setSelectedProject(data.project);
            setShowCreateProject(false);
        } catch (err) {
            console.error('Erreur création projet:', err);
            setError(err.message || 'Erreur lors de la création du projet');
        }
    };

    const handleCreateColumn = async (columnData) => {
        try {
            const data = await dashboardServices.createColumn({ ...columnData, projectId: selectedProject.id });
            setColumns(prev => [...prev, data.column]);
            setShowCreateColumn(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleUpdateTaskStatus = async (taskId, newStatus) => {
        try {
            await dashboardServices.updateTask(taskId, { status: newStatus });
            setTasks(prev => prev.map(task => 
                task.id === taskId ? { ...task, status: newStatus } : task
            ));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await dashboardServices.deleteTask(taskId);
            setTasks(prev => prev.filter(task => task.id !== taskId));
            setShowDeleteModal(false);
            setTaskToDelete(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteProject = async () => {
        try {
            await dashboardServices.deleteProject(selectedProject.id);
            setProjects(prev => prev.filter(project => project.id !== selectedProject.id));
            setSelectedProject(null);
            setShowDeleteProjectModal(false);
        } catch (err) {
            console.error('Erreur suppression projet:', err);
            setError(err.message || 'Erreur lors de la suppression du projet');
        }
    };

    const isCreator = (project) => {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        return currentUser && project.createdBy && project.createdBy.id === currentUser.id;
    };

    const handleEditTask = (task) => {
        setSelectedTask(task);
        setShowEditTask(true);
    };

    const handleUpdateTask = async (taskId, taskData) => {
        try {
            const data = await dashboardServices.updateTask(taskId, taskData);
            
            await fetchTasks(selectedProject.id);
            setShowEditTask(false);
            setSelectedTask(null);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        if (selectedProject) {
            const currentUser = JSON.parse(localStorage.getItem('user'));
            if (currentUser) {
                const currentUserInProject = selectedProject.users?.find(u => u.id === currentUser.id);
                setCurrentUserRole(currentUserInProject?.role);
            } else {
                console.error('Utilisateur non connecté');
                setCurrentUserRole(null);
            }
        }
    }, [selectedProject]);

    useEffect(() => {
        if (selectedProject) {
            fetchTasks(selectedProject.id);
            fetchColumns(selectedProject.id);
        }
    }, [selectedProject]);

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
                    <button onClick={() => window.location.reload()}>Réessayer</button>
                </div>
                <Footer />
            </div>
        );
    }

        return (
        <div className="dashboard-container">
            <Header />
            
            <div className="dashboard-layout">
                {/* Sidebar */}
                <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                    {sidebarOpen ? (
                        <>
                            <div className="sidebar-header">
                                <h2>Mes Projets</h2>
                                <button 
                                    className="sidebar-toggle"
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    ◀
                                </button>
                            </div>
                            
                            <div className="sidebar-content">
                                <button 
                                    className="btn-create-project-sidebar"
                                    onClick={() => setShowCreateProject(true)}
                                >
                                    + Nouveau Projet
                                </button>
                                
                                <div className="projects-list">
                                    {projects.map(project => (
                                        <div 
                                            key={project.id} 
                                            className={`project-item ${selectedProject?.id === project.id ? 'active' : ''}`}
                                            onClick={() => setSelectedProject(project)}
                                        >
                                            <div className="project-info">
                                                <h3>{project.name}</h3>
                                                <p>{project.description || 'Aucune description'}</p>
                                                <small>{project.taskCount} tâches</small>
                                            </div>
                                            {isCreator(project) && (
                                                <span className="creator-indicator">°</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="sidebar-closed">
                            <button 
                                className="sidebar-toggle-closed"
                                onClick={() => setSidebarOpen(true)}
                                title="Ouvrir la liste des projets"
                            >
                                <img src={require('../assets/images/icons/sidebar-closed.svg')} alt="Ouvrir la liste des projets" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="main-content">
                    {selectedProject ? (
                        <div className="kanban-header">
                            <div className="project-info-header">
                                <h1>{selectedProject.name}</h1>
                                <p>{selectedProject.description}</p>
                            </div>
                            
                            <div className="kanban-actions">
                                <button 
                                    className="btn-create-column"
                                    onClick={() => setShowCreateColumn(true)}
                                >
                                    + Nouvelle Colonne
                                </button>
                                <button 
                                    className="btn-manage-users" 
                                    onClick={() => setShowManageUsers(true)}
                                >
                                    👥 Gérer Utilisateurs
                                </button>
                                {isCreator(selectedProject) && (
                                    <button 
                                        className="btn-delete-project" 
                                        onClick={() => setShowDeleteProjectModal(true)}
                                        title="Supprimer ce projet"
                                    >
                                        🗑️ Supprimer Projet
                                    </button>
                                )}
                                <button 
                                    className="btn-create-task"
                                    onClick={() => setShowCreateTask(true)}
                                    disabled={currentUserRole !== 'admin'}
                                    title={currentUserRole !== 'admin' ? 'Seuls les administrateurs peuvent créer des tâches' : ''}
                                >
                                    + Nouvelle Tâche
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="no-project-selected">
                            <h2>Bienvenue sur TaskForce</h2>
                            <p>Sélectionnez un projet dans la sidebar pour commencer</p>
                        </div>
                    )}

                {selectedProject && (
                    <KanbanBoard 
                        columns={columns}
                        tasks={tasks}
                        onUpdateTaskStatus={handleUpdateTaskStatus}
                        onDeleteTask={handleDeleteTask}
                        onShowDeleteModal={(task) => {
                            setTaskToDelete(task);
                            setShowDeleteModal(true);
                        }}
                        onAddSkills={(task) => {
                            setSelectedTask(task);
                            setShowAddSkills(true);
                        }}
                        onEditTask={handleEditTask}
                    />
                )}
            </div>
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

            {showCreateColumn && (
                <CreateColumnModal 
                    onClose={() => setShowCreateColumn(false)}
                    onCreateColumn={handleCreateColumn}
                />
            )}

            {showEditTask && selectedTask && (
                <EditTaskModal 
                    onClose={() => {
                        setShowEditTask(false);
                        setSelectedTask(null);
                    }}
                    onUpdateTask={handleUpdateTask}
                    task={selectedTask}
                    project={selectedProject}
                />
            )}



            {showManageUsers && (
                <ManageUsersModal 
                    onClose={() => setShowManageUsers(false)}
                    project={selectedProject}
                    onUserUpdated={() => {
                        fetchProjects();
                    }}
                />
            )}

            {showAddSkills && selectedTask && (
                <AddSkillsModal 
                    onClose={() => {
                        setShowAddSkills(false);
                        setSelectedTask(null);
                    }}
                    onAddSkills={(skillIds) => {
                        console.log('Compétences ajoutées:', skillIds);
                        setShowAddSkills(false);
                        setSelectedTask(null);
                    }}
                    taskId={selectedTask.id}
                />
            )}

            {showDeleteModal && taskToDelete && (
                <div className="delete-modal-overlay" onClick={() => setShowDeleteModal(false)}>
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

            {showDeleteProjectModal && selectedProject && (
                <div className="delete-modal-overlay" onClick={() => setShowDeleteProjectModal(false)}>
                    <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="delete-modal-header">
                            <h3>Confirmer la suppression du projet</h3>
                            <button 
                                className="btn-close"
                                onClick={() => setShowDeleteProjectModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="delete-modal-body">
                            <p>Êtes-vous sûr de vouloir supprimer le projet :</p>
                            <p className="task-title-confirm">"{selectedProject.name}" ?</p>
                            <p className="delete-warning">⚠️ Cette action est irréversible et supprimera toutes les tâches et colonnes associées.</p>
                        </div>
                        <div className="delete-modal-actions">
                            <button 
                                className="btn-cancel"
                                onClick={() => setShowDeleteProjectModal(false)}
                            >
                                Annuler
                            </button>
                            <button 
                                className="btn-confirm-delete"
                                onClick={handleDeleteProject}
                            >
                                Supprimer le projet
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