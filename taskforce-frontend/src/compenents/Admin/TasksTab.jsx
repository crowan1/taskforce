import React, { useState } from 'react';
import authService from '../../services/authServices';
import '../../assets/styles/compenents/admin/AdminPermissions.scss';

const TasksTab = ({ projectTasks, onCreateTask, onReassignTask, onEditTask, onShowTaskDetail, onDeleteTask, currentUserRole }) => {
    const [expandedTasks, setExpandedTasks] = useState(new Set());
    
    const toggleTaskExpansion = (taskId) => {
        const newExpanded = new Set(expandedTasks);
        if (newExpanded.has(taskId)) {
            newExpanded.delete(taskId);
        } else {
            newExpanded.add(taskId);
        }
        setExpandedTasks(newExpanded);
    };
    
    return (
        <div className="tasks-tab">
            <div className="tab-header">
                <h3>Gestion des Tâches</h3>
                <div className="tab-actions">
                    {authService.canModifyTasks(currentUserRole) && (
                        <button 
                            className="btn-primary"
                            onClick={onCreateTask}
                        >
                            Créer une nouvelle tâche
                        </button>
                    )}
                    {authService.isManager(currentUserRole) && (
                        <div className="manager-info">
                            <span className="info-text">👁️ Mode consultation uniquement</span>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="project-tasks">
                <h4>Tâches du projet</h4>
                {projectTasks.length === 0 ? (
                    <p>Aucune tâche trouvée dans ce projet.</p>
                ) : (
                    <div className="tasks-list">
                        {projectTasks.map(task => (
                            <div key={task.id} className="task-item">
                                <div className="task-header">
                                    <div className="task-title-section" onClick={() => onShowTaskDetail && onShowTaskDetail(task)}>
                                        <h5>{task.title}</h5>
                                    </div>
                                    <div className="task-header-right">
                                        <span className={`priority priority-${task.priority || 'medium'}`}>
                                            {task.priority || 'medium'}
                                        </span>
                                        <button 
                                            className="btn-toggle-actions"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleTaskExpansion(task.id);
                                            }}
                                            title="Afficher/Masquer les actions"
                                        >
                                            {expandedTasks.has(task.id) ? '−' : '+'}
                                        </button>
                                    </div>
                                </div>
                                <p className="task-description">{task.description || 'Aucune description'}</p>
                                <div className="task-meta">
                                    <span className="assigned-to">
                                        Assignée à: {task.assignedTo ? (typeof task.assignedTo === 'object' ? `${task.assignedTo.firstname} ${task.assignedTo.lastname}` : task.assignedTo) : 'En attente d\'assignation'}
                                    </span>
                                    <span className="created-at">
                                        Créée le: {new Date(task.createdAt).toLocaleDateString('fr-FR')}
                                    </span>
                                    <span className="estimated-hours">
                                        Heures estimées: {task.estimatedHours || 1}h
                                    </span>
                                    <span className="task-level">
                                        Niveau: {task.level || 'intermediate'}
                                    </span>
                                </div>
                                <div className={`task-actions ${expandedTasks.has(task.id) ? 'expanded' : 'collapsed'}`}>
                                    <button 
                                        className="btn-view"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onShowTaskDetail && onShowTaskDetail(task);
                                        }}
                                        title="Voir les détails de cette tâche"
                                    >
                                        Voir
                                    </button>
                                    {authService.canModifyTasks(currentUserRole) && (
                                        <>
                                            <button 
                                                className="btn-edit"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEditTask && onEditTask(task);
                                                }}
                                                title="Modifier cette tâche"
                                            >
                                                Modifier
                                            </button>
                                            <button 
                                                className="btn-reassign"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onReassignTask(task);
                                                }}
                                                title="Réassigner cette tâche"
                                            >
                                                Réassigner
                                            </button>
                                            <button 
                                                className="btn-delete"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
                                                        onDeleteTask && onDeleteTask(task.id);
                                                    }
                                                }}
                                                title="Supprimer cette tâche"
                                            >
                                                Supprimer
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TasksTab;
