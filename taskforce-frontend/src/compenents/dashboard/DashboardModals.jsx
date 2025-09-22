import React from 'react';
import ModalManager from './modal/ModalManager';
import AddSkillsModal from './modal/tasks/AddSkillsModal';
import TaskModal from './modal/tasks/TaskModal';
import ProjectInfoModal from './modal/project/DescriptionModal';
import SelectColumnToDeleteModal from './modal/columns/SelectColumnToDeleteModal';
import SelectColumnToEditModal from './modal/columns/SelectColumnToEditModal';
import EditColumnModal from './modal/columns/EditColumnModal';

const DashboardModals = ({ 
    //modal
    showCreateTask, setShowCreateTask,
    showCreateProject, setShowCreateProject,
    showCreateColumn, setShowCreateColumn,
    showEditTask, setShowEditTask,
    showDeleteProjectModal, setShowDeleteProjectModal,
    showAddSkills, setShowAddSkills,
    showDeleteModal, setShowDeleteModal,
    showDeleteColumnModal, setShowDeleteColumnModal,
    showEditColumnModal, setShowEditColumnModal,
    showSelectColumnToDeleteModal, setShowSelectColumnToDeleteModal,
    showSelectColumnToEditModal, setShowSelectColumnToEditModal,
    showTaskDetailModal, setShowTaskDetailModal,
    showDescriptionModal, setShowDescriptionModal,
     
    selectedTask, setSelectedTask,
    selectedProject,
    taskToDelete, setTaskToDelete,
    columnToDelete, setColumnToDelete,
    columnToEdit, setColumnToEdit,
    selectedTaskForDetail, setSelectedTaskForDetail,
     
    columns,
    currentUserRole,
     
    onCreateTask,
    onCreateProject,
    onCreateColumn,
    onUpdateTask,
    onUserUpdated,
    onDeleteProject,
    onDeleteTask,
    handleUpdateColumn,
    handleTaskDetailUpdate,
    fetchProjects
}) => {
    return (
        <>
            <ModalManager 
                showCreateTask={showCreateTask} setShowCreateTask={setShowCreateTask}
                showCreateProject={showCreateProject} setShowCreateProject={setShowCreateProject}
                showCreateColumn={showCreateColumn} setShowCreateColumn={setShowCreateColumn}
                showEditTask={showEditTask} setShowEditTask={setShowEditTask}
                showManageUsers={false} setShowManageUsers={() => {}}
                showDeleteProjectModal={showDeleteProjectModal} setShowDeleteProjectModal={setShowDeleteProjectModal}
                selectedTask={selectedTask} setSelectedTask={setSelectedTask}
                selectedProject={selectedProject}
                onCreateTask={onCreateTask}
                onCreateProject={onCreateProject}
                onCreateColumn={onCreateColumn}
                onUpdateTask={onUpdateTask}
                onUserUpdated={onUserUpdated}
                onDeleteProject={onDeleteProject}
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
                                onClick={() => { 
                                    onDeleteTask(taskToDelete.id);
                                    setShowDeleteModal(false);
                                    setTaskToDelete(null);
                                }}
                            >
                                Supprimer la tâche
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
                                    setShowDeleteColumnModal(false);
                                    setColumnToDelete(null);
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
                <TaskModal 
                    task={selectedTaskForDetail}
                    isOpen={showTaskDetailModal}
                    onClose={() => {
                        setShowTaskDetailModal(false);
                        setSelectedTaskForDetail(null);
                    }}
                    onTaskUpdate={handleTaskDetailUpdate}
                    project={selectedProject}
                    mode="view"
                    currentUserRole={currentUserRole}
                />
            )}

            {showDescriptionModal && selectedProject && (
                <ProjectInfoModal 
                    isOpen={showDescriptionModal}
                    onClose={() => setShowDescriptionModal(false)}
                    title={selectedProject.name}
                    description={selectedProject.description}
                />
            )}
        </>
    );
};

export default DashboardModals;
