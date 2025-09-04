import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../compenents/includes/header';
import Footer from '../compenents/includes/footer';
import { dashboardServices } from '../services/dashboard/dashboardServices';
import authService from '../services/authServices';
import ProjectSelector from '../compenents/Admin/ProjectSelector';
import AdminTabs from '../compenents/Admin/AdminTabs';
import AdminCreateTaskModal from '../compenents/Admin/AdminCreateTaskModal';
import AddUserModal from '../compenents/Admin/AddUserModal';
import ReassignTaskModal from '../compenents/Admin/ReassignTaskModal';


//Styless
import '../assets/styles/compenents/admin/ProjectSelector.scss';
import '../assets/styles/compenents/admin/AdminTabs.scss';
import '../assets/styles/compenents/admin/OverviewTab.scss';
import '../assets/styles/compenents/admin/TasksTab.scss';
import '../assets/styles/compenents/admin/UsersTab.scss';
import '../assets/styles/compenents/admin/AdminCreateTaskModal.scss';
import '../assets/styles/compenents/admin/AddUserModal.scss';
import '../assets/styles/compenents/admin/ReassignTaskModal.scss';
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
    const [showReassignModal, setShowReassignModal] = useState(false);
    const [selectedTaskForReassign, setSelectedTaskForReassign] = useState(null);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    
    const navigate = useNavigate();

    useEffect(() => {
        if (!authService.hasToken()) {
            navigate('/login');
            return;
        }
        fetchData();
    }, []);
 
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
            
            const savedProject = localStorage.getItem('adminSelectedProject');
            if (savedProject) {
                const project = JSON.parse(savedProject);
                const projectExists = projectsData.projects?.find(p => p.id === project.id);
                if (projectExists) {
                    setSelectedProject(project);
                }
            }
            
            if (!localStorage.getItem('adminSelectedProject') && projectsData.projects?.length > 0) {
                const firstProject = projectsData.projects[0];
                setSelectedProject(firstProject);
                localStorage.setItem('adminSelectedProject', JSON.stringify(firstProject));
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
                    assignedTo: task.assignedTo || null,
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
        setSelectedProject(projectId);
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
            await fetchProjectData(selectedProject);
        }
    };

    const handleUserAdded = async () => {
        setShowAddUserModal(false);
        if (selectedProject) {
            await fetchProjectData(selectedProject);
        }
    };

    const handleTaskReassigned = async () => {
        setShowReassignModal(false);
        setSelectedTaskForReassign(null);
        if (selectedProject) {
            await fetchProjectData(selectedProject);
        }
    };

    const handleUserUpdated = async () => {
        if (selectedProject) {
            await fetchProjectData(selectedProject);
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
                        <button onClick={fetchData}>Réessayer</button>
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
                    projects={projects}
                    selectedProject={selectedProject}
                    onProjectChange={handleProjectChange}
                />

                {selectedProject ? (
                                                <AdminTabs
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                projectTasks={projectTasks}
                                projectUsers={projectUsers}
                                onCreateTask={handleCreateTask}
                                onReassignTask={handleReassignTask}
                                onAddUser={handleAddUser}
                                onUserUpdated={handleUserUpdated}
                                onNavigateToDashboard={() => navigate(`/dashboard?project=${selectedProject}`)}
                            />
                ) : (
                    <div className="no-project-selected">
                        <p>Veuillez sélectionner un projet ci-dessus pour commencer.</p>
                    </div>
                )}
            </div>
            <Footer />

            {showCreateTaskModal && selectedProject && (
                <AdminCreateTaskModal
                    isOpen={showCreateTaskModal}
                    onClose={() => setShowCreateTaskModal(false)}
                    projectId={selectedProject}
                    onTaskCreated={handleTaskCreated}
                    projectUsers={projectUsers}
                    projectTasks={projectTasks}
                />
            )}

            {showAddUserModal && selectedProject && (
                <AddUserModal
                    isOpen={showAddUserModal}
                    onClose={() => setShowAddUserModal(false)}
                    projectId={selectedProject}
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
        </div>
    );
};

export default Admin;
