import React from 'react';
import CreateTaskModal from './CreateTaskModal';
import CreateProjectModal from './CreateProjectModal';
import CreateColumnModal from './columns/CreateColumnModal';
import EditTaskModal from './EditTaskModal';
import ManageUsersModal from './ManageUsersModal';
import DeleteProjectModal from './DeleteProjectModal';

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
                <EditTaskModal 
                    onClose={() => {
                        setShowEditTask(false);
                        setSelectedTask(null);
                    }}
                    onUpdateTask={onUpdateTask}
                    task={selectedTask}
                    project={selectedProject}
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
