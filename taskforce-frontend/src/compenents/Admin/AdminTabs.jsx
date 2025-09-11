import React from 'react';
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
    selectedProject
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
            </div>

            <div className="tab-content">
                {activeTab === 'overview' && (
                    <OverviewTab 
                        projectTasks={projectTasks}
                        projectUsers={projectUsers}
                        onCreateTask={onCreateTask}
                        onAddUser={onAddUser}
                        onNavigateToDashboard={onNavigateToDashboard}
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
                    />
                )}

                                            {activeTab === 'users' && (
                                <UsersTab
                                    projectUsers={projectUsers}
                                    projectTasks={projectTasks}
                                    onAddUser={onAddUser}
                                    onUserUpdated={onUserUpdated}
                                    selectedProject={selectedProject}
                                />
                            )}
            </div>
        </>
    );
};

export default AdminTabs;
