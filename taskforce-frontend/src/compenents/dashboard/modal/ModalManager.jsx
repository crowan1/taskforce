import React from 'react';
import CreateTaskModal from './tasks/CreateTaskModal';
import TaskModal from './tasks/TaskModal';
import CreateProjectModal from './project/CreateProjectModal';
import DeleteProjectModal from './project/DeleteProjectModal';
import CreateColumnModal from './columns/CreateColumnModal';
import ManageUsersModal from './ManageUsersModal';

const ModalManager = ({ 
    showCreateTask, setShowCreateTask, 
    showCreateProject, setShowCreateProject, 
    showCreateColumn, setShowCreateColumn, 
    showEditTask, setShowEditTask, 
    showManageUsers, setShowManageUsers, 
    showDeleteProjectModal, setShowDeleteProjectModal,
    selectedTask, setSelectedTask,
    selectedProject,
    onCreateTask, onCreateProject, onCreateColumn, onUpdateTask, onUserUpdated, onDeleteProject
}) => {
    return (
        <>
            {showCreateTask && (
                <CreateTaskModal 
                    isOpen={showCreateTask}
                    onClose={() => setShowCreateTask(false)}
                    onTaskCreated={onCreateTask}
                    projectId={selectedProject?.id}
                />
            )}

            {showCreateProject && (
                <CreateProjectModal 
                    onClose={() => setShowCreateProject(false)}
                    onCreateProject={onCreateProject}
                />
            )}

            {showCreateColumn && (
                <CreateColumnModal 
                    onClose={() => setShowCreateColumn(false)}
                    onCreateColumn={onCreateColumn}
                />
            )}

            {showEditTask && selectedTask && (
                <TaskModal 
                    onClose={() => {
                        setShowEditTask(false);
                        setSelectedTask(null);
                    }}
                    onTaskUpdate={onUpdateTask}
                    task={selectedTask}
                    project={selectedProject}
                    mode="edit"
                />
            )}

            {showManageUsers && (
                <ManageUsersModal 
                    onClose={() => setShowManageUsers(false)}
                    project={selectedProject}
                    onUserUpdated={onUserUpdated}
                />
            )}

            {showDeleteProjectModal && selectedProject && (
                <DeleteProjectModal 
                    onClose={() => setShowDeleteProjectModal(false)}
                    onConfirm={onDeleteProject}
                    project={selectedProject}
                />
            )}
        </>
    );
};

export default ModalManager;
