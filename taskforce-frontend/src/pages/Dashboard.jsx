import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../compenents/includes/header';
import Footer from '../compenents/includes/footer';
import KanbanBoard from '../compenents/dashboard/KanbanBoard';
import ModalManager from '../compenents/dashboard/modal/ModalManager';
import AddSkillsModal from '../compenents/dashboard/modal/AddSkillsModal';
import SelectColumnToDeleteModal from '../compenents/dashboard/modal/columns/SelectColumnToDeleteModal';
import SelectColumnToEditModal from '../compenents/dashboard/modal/columns/SelectColumnToEditModal';
import EditColumnModal from '../compenents/dashboard/modal/columns/EditColumnModal';
import TaskDetailModal from '../compenents/dashboard/modal/TaskDetailModal';

import { dashboardServices } from '../services/dashboard/dashboardServices';

// styles
import '../assets/styles/compenents/Dashboard/CreateTaskProjectModal.scss';
import '../assets/styles/compenents/Dashboard/ModalDelete.scss';
import '../assets/styles/compenents/Dashboard/TaskCard.scss';
import '../assets/styles/compenents/Dashboard/TaskDetailModal.scss';
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
    const [showDeleteColumnModal, setShowDeleteColumnModal] = useState(false);
    const [columnToDelete, setColumnToDelete] = useState(null);
    const [showEditColumnModal, setShowEditColumnModal] = useState(false);
    const [columnToEdit, setColumnToEdit] = useState(null);

    const [showColumnActionsMenu, setShowColumnActionsMenu] = useState(false);

    const [showSelectColumnToDeleteModal, setShowSelectColumnToDeleteModal] = useState(false);
    const [showSelectColumnToEditModal, setShowSelectColumnToEditModal] = useState(false);
    const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
    const [selectedTaskForDetail, setSelectedTaskForDetail] = useState(null);
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

    // drag & drop des colonnes
    const handleReorderColumns = async (draggedColumnId, targetColumnId) => {
        try {
            const current = [...columns];
            const draggedIndex = current.findIndex(c => c.id === draggedColumnId);
            const targetIndex = current.findIndex(c => c.id === targetColumnId);
            if (draggedIndex === -1 || targetIndex === -1) return;

            const [dragged] = current.splice(draggedIndex, 1);
            current.splice(targetIndex, 0, dragged);

            const updated = current.map((c, idx) => ({ ...c, position: idx }));
            setColumns(updated);

            await Promise.all(updated.map(c =>
                dashboardServices.updateColumn(c.id, { position: c.position })
            ));
        } catch (err) {
            setError(err.message || 'Erreur lors du réordonnancement des colonnes');
            if (selectedProject) {
                fetchColumns(selectedProject.id);
            }
        }
    };

    // Edit d'une colonne
    const handleEditColumn = (column) => {
        setColumnToEdit(column);
        setShowEditColumnModal(true);
    };



    const handleUpdateColumn = async (columnId, columnData) => {
        try {
            const data = await dashboardServices.updateColumn(columnId, columnData);
            setColumns(prev => prev.map(col => 
                col.id === columnId ? { ...col, ...data.column } : col
            ));
            setShowEditColumnModal(false);
            setColumnToEdit(null);
        } catch (err) {
            setError(err.message || 'Erreur lors de la mise à jour de la colonne');
        }
    };



    const handleCreateTask = async (taskData) => {
        try {
            setTasks(prev => [...prev, taskData]);
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
            setError(err.message || 'Erreur lors de la création du projet');
        }
    };

    const handleAssignTask = async (taskId) => {
        try {
            const response = await dashboardServices.assignTaskAutomatically(taskId);
            
            setTasks(prev => prev.map(task => 
                task.id === taskId 
                    ? { ...task, assignedTo: response.assignedTo }
                    : task
            ));
        } catch (err) {
            setError(err.message || 'Erreure lors de l\'assignation de la tâche');
        }
    };

    const handleAssignAllTasks = async () => {
        if (!selectedProject) return;
        
        try {
            const response = await dashboardServices.assignAllProjectTasks(selectedProject.id);
            
            await fetchTasks(selectedProject.id);
        } catch (err) {
            setError(err.message || 'Erreur lors de l\'assignation des tâche');
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
            setError(err.message || 'Erreur lors de la suppression du projet');
        }
    };

    const isCreator = (project) => {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        return currentUser && project.createdBy && project.createdBy.id === currentUser.id;
    };

    const isAdmin = role => role === 'responsable_projet';
    const isManager = role => ['responsable_projet', 'manager'].includes(role);
    const canDeleteColumns = role => role === 'responsable_projet';
    const canManageUsers = role => role === 'responsable_projet';
    const canDeleteProject = role => role === 'responsable_projet';

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

    const handleShowTaskDetail = (task) => {
        setSelectedTaskForDetail(task);
        setShowTaskDetailModal(true);
    };

    const handleTaskDetailUpdate = async () => {
        if (selectedProject) {
            await fetchTasks(selectedProject.id);
            await fetchColumns(selectedProject.id);
            
            if (selectedTaskForDetail) {
                const updatedTasks = await dashboardServices.getTasks(selectedProject.id);
                if (updatedTasks && Array.isArray(updatedTasks)) {
                    const updatedTask = updatedTasks.find(t => t.id === selectedTaskForDetail.id);
                    if (updatedTask) {
                        setSelectedTaskForDetail(updatedTask);
                    }
                }
            }
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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showColumnActionsMenu && !event.target.closest('.column-actions-dropdown')) {
                setShowColumnActionsMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showColumnActionsMenu]);

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
                                <img src={require('../assets/icons/fleche-droite.png')} alt="Ouvrir la liste des projets" className="sidebar-toggle-icon" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="main-content">
                    {selectedProject ? (
                        <div className="kanban-header">
                            <div className="project-info-header">
                                <h1>{selectedProject.name}</h1>
                                <p>{selectedProject.description}</p>
                                                            {currentUserRole && (
                                <div className="current-user-role">
                                    <span className="role-indicator">
                                        {currentUserRole}
                                    </span>

                                </div>
                            )}
                            </div>
                            
                            <div className="kanban-actions">
                                {isManager(currentUserRole) && (
                                    <div className="column-actions-dropdown">
                                        <button 
                                            className="btn-column-actions"
                                            onClick={() => setShowColumnActionsMenu(!showColumnActionsMenu)}
                                        >
                                            ⋮ Gérer les Colonnes
                                        </button>
                                        
                                        {showColumnActionsMenu && (
                                            <div className="column-actions-menu">
                                                <button 
                                                    className="menu-item add-column"
                                                    onClick={() => {
                                                        setShowCreateColumn(true);
                                                        setShowColumnActionsMenu(false);
                                                    }}
                                                >
                                                    Nouvelle Colonne
                                                </button>
                                                <button 
                                                    className="menu-item edit-columns"
                                                    onClick={() => {
                                                        setShowColumnActionsMenu(false);
                                                        setShowSelectColumnToEditModal(true);
                                                    }}
                                                >
                                                    Modifier une Colonne
                                                </button>
                                                {canDeleteColumns(currentUserRole) && (
                                                    <button 
                                                        className="menu-item delete-columns"
                                                        onClick={() => {
                                                            setShowColumnActionsMenu(false);
                                                            setShowSelectColumnToDeleteModal(true);
                                                        }}
                                                    >
                                                        Supprimer une Colonne
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                {canManageUsers(currentUserRole) && (
                                    <button 
                                        className="btn-manage-users" 
                                        onClick={() => setShowManageUsers(true)}
                                    >
                                         Gérer Utilisateurs
                                    </button>
                                )}
                                {isManager(currentUserRole) && (
                                    <button 
                                        className="btn-assign-all"
                                        onClick={handleAssignAllTasks}
                                        title="Assigner automatiquement toutes les tâches non assignées"
                                    >
                                         Assigner Toutes
                                    </button>
                                )}

                                {canDeleteProject(currentUserRole) && (
                                    <button 
                                        className="btn-delete-project" 
                                        onClick={() => setShowDeleteProjectModal(true)}
                                        title="Seuls les responsables de projet peuvent supprimer des projets"
                                    >
                                        Supprimer Projet
                                    </button>
                                )}
                                {isManager(currentUserRole) && (
                                    <button 
                                        className="btn-create-task"
                                        onClick={() => setShowCreateTask(true)}
                                        title="Créer une nouvelle tâche"
                                    >
                                        + Nouvelle Tâche
                                    </button>
                                )}
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
                        onAssignTask={handleAssignTask}
                        currentUserRole={currentUserRole}
                        onReorderColumns={handleReorderColumns}
                        onShowTaskDetail={handleShowTaskDetail}
                    />
                )}
            </div>
        </div>

            <ModalManager 
                showCreateTask={showCreateTask} setShowCreateTask={setShowCreateTask}
                showCreateProject={showCreateProject} setShowCreateProject={setShowCreateProject}
                showCreateColumn={showCreateColumn} setShowCreateColumn={setShowCreateColumn}
                showEditTask={showEditTask} setShowEditTask={setShowEditTask}
                showManageUsers={showManageUsers} setShowManageUsers={setShowManageUsers}
                showDeleteProjectModal={showDeleteProjectModal} setShowDeleteProjectModal={setShowDeleteProjectModal}
                selectedTask={selectedTask} setSelectedTask={setSelectedTask}
                selectedProject={selectedProject}
                onCreateTask={handleCreateTask}
                onCreateProject={handleCreateProject}
                onCreateColumn={handleCreateColumn}
                onUpdateTask={handleUpdateTask}
                onUserUpdated={() => fetchProjects()}
                onDeleteProject={handleDeleteProject}
            />

            {showAddSkills && selectedTask && (
                <AddSkillsModal 
                    onClose={() => {
                        setShowAddSkills(false);
                        setSelectedTask(null);
                    }}
                    onAddSkills={(skillIds) => {

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



            {showDeleteColumnModal && columnToDelete && (
                <div className="delete-modal-overlay" onClick={() => setShowDeleteColumnModal(false)}>
                    <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="delete-modal-header">
                            <h3>Confirmer la suppression de la colonne</h3>
                            <button 
                                className="btn-close"
                                onClick={() => setShowDeleteColumnModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="delete-modal-body">
                            <p>Êtes-vous sûr de vouloir supprimer la colonne :</p>
                            <p className="task-title-confirm">"{columnToDelete.name}" ?</p>
                            <p className="delete-warning">Cette action est irréversible.</p>
                        </div>
                        <div className="delete-modal-actions">
                            <button 
                                className="btn-cancel"
                                onClick={() => setShowDeleteColumnModal(false)}
                            >
                                Annuler
                            </button>
                            <button 
                                className="btn-confirm-delete"
                                onClick={() => {
                                    dashboardServices.deleteColumn(columnToDelete.id).then(() => {
                                        setColumns(columns.filter(col => col.id !== columnToDelete.id));
                                        setShowDeleteColumnModal(false);
                                        setColumnToDelete(null);
                                    }).catch(err => {
                                        setError(err.message || 'Erreur lors de la suppression de la colonne');
                                    });
                                }}
                            >
                                Supprimer la colonne
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showEditColumnModal && columnToEdit && (
                <EditColumnModal 
                    isOpen={showEditColumnModal}
                    onClose={() => {
                        setShowEditColumnModal(false);
                        setColumnToEdit(null);
                    }}
                    column={columnToEdit}
                    onUpdateColumn={handleUpdateColumn}
                />
            )}



            {showSelectColumnToDeleteModal && (
                <SelectColumnToDeleteModal 
                    isOpen={showSelectColumnToDeleteModal}
                    onClose={() => setShowSelectColumnToDeleteModal(false)}
                    columns={columns}
                    onSelectColumn={(column) => {
                        setColumnToDelete(column);
                        setShowSelectColumnToDeleteModal(false);
                        setShowDeleteColumnModal(true);
                    }}
                />
            )}

            {showSelectColumnToEditModal && (
                <SelectColumnToEditModal 
                    isOpen={showSelectColumnToEditModal}
                    onClose={() => setShowSelectColumnToEditModal(false)}
                    columns={columns}
                    onSelectColumn={(column) => {
                        setColumnToEdit(column);
                        setShowSelectColumnToEditModal(false);
                        setShowEditColumnModal(true);
                    }}
                />
            )}

            {showTaskDetailModal && selectedTaskForDetail && (
                <TaskDetailModal 
                    task={selectedTaskForDetail}
                    isOpen={showTaskDetailModal}
                    onClose={() => {
                        setShowTaskDetailModal(false);
                        setSelectedTaskForDetail(null);
                    }}
                    onTaskUpdate={handleTaskDetailUpdate}
                />
            )}

            <Footer />
        </div>
    );
};

export default Dashboard;