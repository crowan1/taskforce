import React from 'react';
import AlertsTab from './OverviewTab';
import OverviewTab from './OverviewTab';
import TasksTab from './TasksTab';
import UsersTab from './UsersTab';

const AdminTabs = ({ 
    activeTab, 
    setActiveTab, 
    projectTasks, 
    projectUsers, 
    onCreateTask, 
    onEditTask,
    onShowTaskDetail,
    onReassignTask,
    onDeleteTask,
    onAddUser, 
    onUserUpdated,
    onNavigateToDashboard,
    selectedProject,
    currentUserRole
}) => {
    return (
        <>
            <div className="admin-tabs">
                <button 
                    className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Vue d'ensemble
                </button>
                <button 
                    className={`tab-button ${activeTab === 'tasks' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tasks')}
                >
                    Gestion des Tâches
                </button>
                <button 
                    className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    Gestion des Utilisateurs
                </button>
                <button 
                    className={`tab-button ${activeTab === 'alerts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('alerts')}
                >
                    Alertes & Notifications
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'overview' && (
                    <OverviewTab 
                        projectTasks={projectTasks}
                        projectUsers={projectUsers}
                        onCreateTask={onCreateTask}
                        onAddUser={onAddUser}
                        onNavigateToDashboard={onNavigateToDashboard}
                        selectedProject={selectedProject}
                    />
                )}

                {activeTab === 'tasks' && (
                    <TasksTab 
                        projectTasks={projectTasks}
                        onCreateTask={onCreateTask}
                        onEditTask={onEditTask}
                        onShowTaskDetail={onShowTaskDetail}
                        onReassignTask={onReassignTask}
                        onDeleteTask={onDeleteTask}
                        currentUserRole={currentUserRole}
                    />
                )}

                {activeTab === 'users' && (
                    <UsersTab
                        projectUsers={projectUsers}
                        projectTasks={projectTasks}
                        onAddUser={onAddUser}
                        onUserUpdated={onUserUpdated}
                        selectedProject={selectedProject}
                        currentUserRole={currentUserRole}
                    />
                )}

                {activeTab === 'alerts' && (
                    <OverviewTab 
                        projectTasks={projectTasks}
                        projectUsers={projectUsers}
                        onCreateTask={onCreateTask}
                        onAddUser={onAddUser}
                        onNavigateToDashboard={onNavigateToDashboard}
                        selectedProject={selectedProject}
                        mode="alerts"
                    />
                )}
            </div>
        </>
    );
};

export default AdminTabs;
