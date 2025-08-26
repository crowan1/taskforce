import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../compenents/includes/header';
import Footer from '../compenents/includes/footer';
import KanbanBoard from '../compenents/dashboard/KanbanBoard';
import CreateTaskModal from '../compenents/dashboard/modal/CreateTaskModal';
import CreateProjectModal from '../compenents/dashboard/modal/CreateProjectModal';
import CreateColumnModal from '../compenents/dashboard/modal/CreateColumnModal';
import AddUserModal from '../compenents/dashboard/modal/AddUserModal';
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
    const [showAddUser, setShowAddUser] = useState(false);
    const [showManageUsers, setShowManageUsers] = useState(false);
    const [showAddSkills, setShowAddSkills] = useState(false);
    const [showEditTask, setShowEditTask] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [currentUserRole, setCurrentUserRole] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
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
            setProjects(prev => [...prev, data.project]);
            setSelectedProject(data.project);
            setShowCreateProject(false);
        } catch (err) {
            setError(err.message);
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
            const currentUserInProject = selectedProject.users?.find(u => u.id === currentUser.id);
            setCurrentUserRole(currentUserInProject?.role);
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
                            className="btn-create-column"
                            onClick={() => setShowCreateColumn(true)}
                            disabled={!selectedProject}
                        >
                            + Nouvelle Colonne
                        </button>
                                            <button 
                        className="btn-add-user" 
                        onClick={() => setShowAddUser(true)}
                        disabled={!selectedProject || currentUserRole !== 'admin'}
                        title={currentUserRole !== 'admin' ? 'Seuls les administrateurs peuvent ajouter des utilisateurs' : ''}
                    >
                        + Ajouter Utilisateur
                    </button>

                    <button 
                        className="btn-manage-users" 
                        onClick={() => setShowManageUsers(true)}
                        disabled={!selectedProject}
                    >
                        👥 Gérer Utilisateurs
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

                {!selectedProject && (
                    <div className="no-project">
                        <h2>Aucun projet sélectionné</h2>
                        <p>Créez votre projet</p>
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

            {showAddUser && (
                <AddUserModal 
                    onClose={() => setShowAddUser(false)}
                    onAddUser={(user) => {
                        console.log('Utilisateur ajouté:', user);
                        setShowAddUser(false);
                        // Rafraîchir les projets pour mettre à jour la liste des utilisateurs
                        fetchProjects();
                    }}
                    projectId={selectedProject?.id}
                    projectUsers={selectedProject?.users || []}
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

            <Footer />
        </div>
    );
};

export default Dashboard;