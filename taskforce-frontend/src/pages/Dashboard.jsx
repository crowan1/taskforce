import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Header from '../compenents/includes/header';
import Footer from '../compenents/includes/footer';
import KanbanBoard from '../compenents/dashboard/KanbanBoard';
import KanbanHeader from '../compenents/dashboard/KanbanHeader';
import ProjectSidebar from '../compenents/dashboard/ProjectSidebar';
import DashboardModals from '../compenents/dashboard/DashboardModals';
import UpgradeModal from '../compenents/dashboard/modal/UpgradeModal';

import { dashboardServices } from '../services/dashboard/dashboardServices';
import authService from '../services/authServices';

import '../styles/dashboard.scss';

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


    const [showAddSkills, setShowAddSkills] = useState(false);
    const [showEditTask, setShowEditTask] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [currentUserRole, setCurrentUserRole] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showDeleteColumnModal, setShowDeleteColumnModal] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [columnToDelete, setColumnToDelete] = useState(null);
    const [showEditColumnModal, setShowEditColumnModal] = useState(false);
    const [columnToEdit, setColumnToEdit] = useState(null);

    const [showColumnActionsMenu, setShowColumnActionsMenu] = useState(false);

    const [showSelectColumnToDeleteModal, setShowSelectColumnToDeleteModal] = useState(false);
    const [showSelectColumnToEditModal, setShowSelectColumnToEditModal] = useState(false);
    const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
    const [selectedTaskForDetail, setSelectedTaskForDetail] = useState(null);
    const [showDescriptionModal, setShowDescriptionModal] = useState(false);
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
            if (err.status === 403) {
  
                setShowUpgradeModal(true);
                setShowCreateProject(false);
                return;
            }
            
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
            setError(err.message || 'Erreur lors de la suppression du projet');
        }
    };

    const isCreator = (project) => {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        return currentUser && project.createdBy && project.createdBy.id === currentUser.id;
    };

    const isManager = role => authService.canAccessAdmin(role);  
    const canDeleteColumns = role => authService.canModifyTasks(role); 
    const canDeleteProject = role => authService.canManageProject(role); 
    const canCreateTasks = role => authService.canModifyTasks(role); 

    const handleEditTask = (task) => {
        setSelectedTask(task);
        setShowEditTask(true);
    };

    const handleUpdateTask = async (taskId, taskData) => {
        try {
            await dashboardServices.updateTask(taskId, taskData);
            
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

    const handleTaskDetailUpdate = async (taskId, taskData) => {
        try {
            if (taskId && taskData) {
                await dashboardServices.updateTask(taskId, taskData);
            }
            
            if (selectedProject) {
                await fetchTasks(selectedProject.id);
                await fetchColumns(selectedProject.id);
                
                if (selectedTaskForDetail) {
                    const updatedTasksData = await dashboardServices.getTasks(selectedProject.id);
                    const updatedTasks = updatedTasksData?.tasks || [];
                    const updatedTask = updatedTasks.find(t => t.id === selectedTaskForDetail.id);
                    if (updatedTask) {
                        setSelectedTaskForDetail(updatedTask);
                    }
                }
            }
        } catch (err) {
            setError(err.message || 'Erreur lors de la mise à jour de la tâche');
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const [currentUser] = useLocalStorage('user');
    const userRole = useMemo(() => {
        if (!selectedProject || !currentUser) return null;
        const currentUserInProject = selectedProject.users?.find(u => u.id === currentUser.id);
        return currentUserInProject?.role || null;
    }, [selectedProject, currentUser]);

    useEffect(() => {
        setCurrentUserRole(userRole);
        authService.setCurrentUserRole(userRole);
    }, [userRole]);

    useEffect(() => {
        if (selectedProject) {
            Promise.all([
                fetchTasks(selectedProject.id),
                fetchColumns(selectedProject.id)
            ]).catch(() => {});
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
                <ProjectSidebar 
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    projects={projects}
                    selectedProject={selectedProject}
                    setSelectedProject={setSelectedProject}
                    setShowCreateProject={setShowCreateProject}
                    isCreator={isCreator}
                />

                <div className="main-content">
                    <KanbanHeader 
                        selectedProject={selectedProject}
                        currentUserRole={currentUserRole}
                        showColumnActionsMenu={showColumnActionsMenu}
                        setShowColumnActionsMenu={setShowColumnActionsMenu}
                        setShowCreateColumn={setShowCreateColumn}
                        setShowSelectColumnToEditModal={setShowSelectColumnToEditModal}
                        setShowSelectColumnToDeleteModal={setShowSelectColumnToDeleteModal}
                        setShowDeleteProjectModal={setShowDeleteProjectModal}
                        setShowCreateTask={setShowCreateTask}
                        setShowDescriptionModal={setShowDescriptionModal}
                        isManager={isManager}
                        canDeleteColumns={canDeleteColumns}
                        canDeleteProject={canDeleteProject}
                        canCreateTasks={canCreateTasks}
                    />

                {selectedProject ? (
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
                        currentUserRole={currentUserRole}
                        onReorderColumns={handleReorderColumns}
                        onShowTaskDetail={handleShowTaskDetail}
                    />
                ) : !loading && (
                    <div className="no-projects-message">
                        <div className="no-projects-content">
                            <div className="no-projects-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                    <circle cx="9" cy="9" r="2"/>
                                    <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                                </svg>
                            </div>
                            <h3>Aucun projet disponible</h3>
                            <p>Vous n'avez pas encore de projets en tant que responsable projet.</p>
                            <button 
                                className="btn-create-project"
                                onClick={() => setShowCreateProject(true)}
                            >
                                Créer mon premier projet
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>

            <DashboardModals  
            //MOdal
                showCreateTask={showCreateTask} setShowCreateTask={setShowCreateTask}
                showCreateProject={showCreateProject} setShowCreateProject={setShowCreateProject}
                showCreateColumn={showCreateColumn} setShowCreateColumn={setShowCreateColumn}
                showEditTask={showEditTask} setShowEditTask={setShowEditTask}
                showDeleteProjectModal={showDeleteProjectModal} setShowDeleteProjectModal={setShowDeleteProjectModal}
                showAddSkills={showAddSkills} setShowAddSkills={setShowAddSkills}
                showDeleteModal={showDeleteModal} setShowDeleteModal={setShowDeleteModal}
                showDeleteColumnModal={showDeleteColumnModal} setShowDeleteColumnModal={setShowDeleteColumnModal}
                showEditColumnModal={showEditColumnModal} setShowEditColumnModal={setShowEditColumnModal}
                showSelectColumnToDeleteModal={showSelectColumnToDeleteModal} setShowSelectColumnToDeleteModal={setShowSelectColumnToDeleteModal}
                showSelectColumnToEditModal={showSelectColumnToEditModal} setShowSelectColumnToEditModal={setShowSelectColumnToEditModal}
                showTaskDetailModal={showTaskDetailModal} setShowTaskDetailModal={setShowTaskDetailModal}
                showDescriptionModal={showDescriptionModal} setShowDescriptionModal={setShowDescriptionModal}
                 
                selectedTask={selectedTask} setSelectedTask={setSelectedTask}
                selectedProject={selectedProject}
                taskToDelete={taskToDelete} setTaskToDelete={setTaskToDelete}
                columnToDelete={columnToDelete} setColumnToDelete={setColumnToDelete}
                columnToEdit={columnToEdit} setColumnToEdit={setColumnToEdit}
                selectedTaskForDetail={selectedTaskForDetail} setSelectedTaskForDetail={setSelectedTaskForDetail}
                 
                columns={columns}
                currentUserRole={currentUserRole}
                 
                onCreateTask={handleCreateTask}
                onCreateProject={handleCreateProject}
                onCreateColumn={handleCreateColumn}
                onUpdateTask={handleUpdateTask}
                onUserUpdated={() => fetchProjects()}
                onDeleteProject={handleDeleteProject}
                onDeleteTask={handleDeleteTask}
                handleUpdateColumn={handleUpdateColumn}
                handleTaskDetailUpdate={handleTaskDetailUpdate}
                fetchProjects={fetchProjects}
            />

            <UpgradeModal 
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
            />

        <Footer />
    </div>
    );
};

export default Dashboard;