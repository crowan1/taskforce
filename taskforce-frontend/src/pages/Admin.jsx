import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../compenents/includes/header';
import Footer from '../compenents/includes/footer';
import { dashboardServices } from '../services/dashboard/dashboardServices';
import authService from '../services/authServices';
import ProjectSelector from '../compenents/Admin/ProjectSelector';
import AdminTabs from '../compenents/Admin/AdminTabs';
import CreateTaskModal from '../compenents/dashboard/modal/tasks/CreateTaskModal';
import TaskModal from '../compenents/dashboard/modal/tasks/TaskModal';
import AddUserModal from '../compenents/Admin/AddUserModal';
import ReassignTaskModal from '../compenents/Admin/ReassignTaskModal';

import '../assets/styles/compenents/admin/ProjectSelector.scss';
import '../assets/styles/compenents/admin/AdminTabs.scss';
import '../assets/styles/compenents/admin/OverviewTab.scss';
import '../assets/styles/compenents/admin/TasksTab.scss';
import '../assets/styles/compenents/admin/UsersTab.scss';
import '../assets/styles/compenents/admin/AddUserModal.scss';
import '../assets/styles/compenents/admin/ReassignTaskModal.scss';
import '../assets/styles/compenents/admin/AlertsTab.scss';
import '../assets/styles/Admin.scss';

const Admin = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    
    const [selectedProject, setSelectedProject] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    
    const [projectTasks, setProjectTasks] = useState([]);
    const [projectUsers, setProjectUsers] = useState([]);
    
    const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
    const [showEditTaskModal, setShowEditTaskModal] = useState(false);
    const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);
    const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
    const [selectedTaskForDetail, setSelectedTaskForDetail] = useState(null);
    const [showReassignModal, setShowReassignModal] = useState(false);
    const [selectedTaskForReassign, setSelectedTaskForReassign] = useState(null);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            const isAuth = await authService.isAuthenticated();
            if (!isAuth) {
                navigate('/login');
                return;
            }
            await fetchData();
        };
        
        checkAuth();
    }, [navigate]);

    const [currentUserRole, setCurrentUserRole] = useState(null);
    const [adminAccessibleProjects, setAdminAccessibleProjects] = useState([]);

    // Vérifier les permissions admin globalement
    useEffect(() => {
        if (projects.length > 0 && currentUser) {
            // Vérif si utilisateur est responsable ou manager a un projet
            const canAccess = authService.canAccessAdminGlobally(projects, currentUser.id);
            
            if (!canAccess) {
                setError('Accès refusé : Vous devez être manager ou responsable de projet sur au moins un projet pour accéder à la section Admin.');
                setLoading(false);
                return;
            }

            // Filtrer les projets accessible
            const accessibleProjects = authService.getAdminAccessibleProjects(projects, currentUser.id);
            setAdminAccessibleProjects(accessibleProjects);
            
            if (accessibleProjects.length > 0 && !selectedProject) {
                setSelectedProject(accessibleProjects[0]);
            }
        }
    }, [projects, currentUser, selectedProject]);
 
    useEffect(() => {
        if (selectedProject && currentUser) {
            const userRole = authService.getUserRoleInProject(selectedProject, currentUser.id);
            setCurrentUserRole(userRole);
        }
    }, [selectedProject, currentUser]);
 
    useEffect(() => {
        if (selectedProject) {
            fetchProjectData(selectedProject.id);
        }
    }, [selectedProject]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [projectsData, profileData] = await Promise.all([
                dashboardServices.getProjects(),
                dashboardServices.getProfile()
            ]);
            
            setProjects(projectsData.projects || []);
            setCurrentUser(profileData.user || profileData);
            
            const savedProject = sessionStorage.getItem('adminSelectedProject');
            if (savedProject) {
                const project = JSON.parse(savedProject);
                const projectExists = projectsData.projects?.find(p => p.id === project.id);
                if (projectExists) {
                    setSelectedProject(project);
                }
            }
            
            if (!sessionStorage.getItem('adminSelectedProject') && projectsData.projects?.length > 0) {
                const firstProject = projectsData.projects[0];
                setSelectedProject(firstProject);
                sessionStorage.setItem('adminSelectedProject', JSON.stringify(firstProject));
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjectData = async (projectId) => {
        try {
            const tasksData = await dashboardServices.getTasks(projectId);
            if (tasksData && tasksData.tasks) {
                const validatedTasks = tasksData.tasks.map(task => ({
                    id: task.id || 0,
                    title: task.title || 'Sans titre',
                    description: task.description || '',
                    priority: task.priority || 'medium',
                    level: task.level || 'intermediate',
                    estimatedHours: task.estimatedHours || 1,
                    assignedTo: task.assignedTo || null,
                    requiredSkills: task.requiredSkills || [],
                    createdAt: task.createdAt || new Date().toISOString()
                }));
                
                const sortedTasks = validatedTasks.sort((a, b) => 
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                setProjectTasks(sortedTasks);
            }

            const usersData = await dashboardServices.getProjectUsers(projectId);
            if (usersData && usersData.users) {
                const validatedUsers = usersData.users.map(user => ({
                    id: user.id || 0,
                    firstname: user.firstname || '',
                    lastname: user.lastname || '',
                    email: user.email || '',
                    role: user.role || 'collaborateur',
                    skills: user.skills || []
                }));
                
                setProjectUsers(validatedUsers);
            }
        } catch (err) {
            console.error('Error fetching project data:', err);
        }
    };

    const handleProjectChange = (projectId) => {
        if (projectId) {
            const project = projects.find(p => p.id === projectId);
            if (project) {
                setSelectedProject(project);
                sessionStorage.setItem('adminSelectedProject', JSON.stringify(project));
            }
        } else {
            setSelectedProject(null);
            sessionStorage.removeItem('adminSelectedProject');
        }
        setActiveTab('overview');
    };

    const handleCreateTask = () => {
        setShowCreateTaskModal(true);
    };

    const handleReassignTask = (task) => {
        setSelectedTaskForReassign(task);
        setShowReassignModal(true);
    };

    const handleAddUser = () => {
        setShowAddUserModal(true);
    };

    const handleTaskCreated = async () => {
        setShowCreateTaskModal(false);
        if (selectedProject) {
            await fetchProjectData(selectedProject.id);
        }
    };

    const handleUserAdded = async () => {
        setShowAddUserModal(false);
        if (selectedProject) {
            await fetchProjectData(selectedProject.id);
        }
    };

    const handleTaskReassigned = async () => {
        setShowReassignModal(false);
        setSelectedTaskForReassign(null);
        if (selectedProject) {
            await fetchProjectData(selectedProject.id);
        }
    };

    const handleEditTask = (task) => {
        setSelectedTaskForEdit(task);
        setShowEditTaskModal(true);
    };

    const handleShowTaskDetail = (task) => {
        setSelectedTaskForDetail(task);
        setShowTaskDetailModal(true);
    };

    const handleTaskUpdated = async () => {
        setShowEditTaskModal(false);
        setSelectedTaskForEdit(null);
        if (selectedProject) {
            await fetchProjectData(selectedProject.id);
        }
    };

    const handleUserUpdated = async () => {
        if (selectedProject) {
            await fetchProjectData(selectedProject.id);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await dashboardServices.deleteTask(taskId);
            if (selectedProject) {
                await fetchProjectData(selectedProject.id);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <div className="admin-container">
                <Header />
                <div className="admin-content">
                    <div className="loading-spinner"></div>
                    <p>Chargement...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-container">
                <Header />
                <div className="admin-content">
                    <div className="error-message">
                        <p>Erreur: {error}</p>
                        {error.includes('Accès refusé') ? (
                            <p className="error-redirect">Redirection vers le tableau de bord dans 3 secondes...</p>
                        ) : (
                            <button onClick={fetchData}>Réessayer</button>
                        )}
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="admin-container">
            <Header />
            <div className="admin-content">
                <ProjectSelector 
                    projects={adminAccessibleProjects}
                    selectedProject={selectedProject}
                    onProjectChange={handleProjectChange}
                />

                {selectedProject ? (
                                                <AdminTabs
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                projectTasks={projectTasks}
                                projectUsers={projectUsers}
                        selectedProject={selectedProject}
                        currentUserRole={currentUserRole}
                        onCreateTask={handleCreateTask}
                                onEditTask={handleEditTask}
                                onShowTaskDetail={handleShowTaskDetail}
                                onReassignTask={handleReassignTask}
                                onDeleteTask={handleDeleteTask}
                                onAddUser={handleAddUser}
                                onUserUpdated={handleUserUpdated}
                                onNavigateToDashboard={() => navigate(`/dashboard?project=${selectedProject}`)}
                            />
                ) : (
                    <div className="no-project-selected">
                        <h2>Aucun projet accessible</h2>
                        <p>Vous devez être manager ou responsable de projet pour accéder à l'administration.</p>
                    </div>
                )}
            </div>
            <Footer />

            {showCreateTaskModal && selectedProject && (
                <CreateTaskModal
                    isOpen={showCreateTaskModal}
                    onClose={() => setShowCreateTaskModal(false)}
                    projectId={selectedProject.id}
                    onTaskCreated={handleTaskCreated}
                    projectUsers={projectUsers}
                    projectTasks={projectTasks}
                    autoAssign={true}
                />
            )}

            {showAddUserModal && selectedProject && (
                <AddUserModal
                    isOpen={showAddUserModal}
                    onClose={() => setShowAddUserModal(false)}
                    projectId={selectedProject.id}
                    onUserAdded={handleUserAdded}
                />
            )}

            {showReassignModal && selectedTaskForReassign && (
                <ReassignTaskModal
                    isOpen={showReassignModal}
                    onClose={() => setShowReassignModal(false)}
                    task={selectedTaskForReassign}
                    projectUsers={projectUsers}
                    projectTasks={projectTasks}
                    onTaskReassigned={handleTaskReassigned}
                />
            )}

            {showEditTaskModal && selectedTaskForEdit && selectedProject && (
                <TaskModal
                    isOpen={showEditTaskModal}
                    onClose={() => {
                        setShowEditTaskModal(false);
                        setSelectedTaskForEdit(null);
                    }}
                    onTaskUpdate={async (taskId, taskData) => {
                        try {
                            await dashboardServices.updateTask(taskId, taskData);
                            await handleTaskUpdated();
                        } catch (err) {
                            console.error('Erreur lors de la mise à jour de la tâche:', err);
                        }
                    }}
                    task={selectedTaskForEdit}
                    project={selectedProject}
                    mode="edit"
                />
            )}

            {showTaskDetailModal && selectedTaskForDetail && selectedProject && (
                <TaskModal
                    isOpen={showTaskDetailModal}
                    onClose={() => {
                        setShowTaskDetailModal(false);
                        setSelectedTaskForDetail(null);
                    }}
                    onTaskUpdate={async (taskId, taskData) => {
                        try {
                            await dashboardServices.updateTask(taskId, taskData);
                            await handleTaskUpdated();
                        } catch (err) {
                            console.error('Erreur lors de la mise à jour de la tâche:', err);
                        }
                    }}
                    task={selectedTaskForDetail}
                    project={selectedProject}
                    mode="view"
                />
            )}
        </div>
    );
};

export default Admin;
