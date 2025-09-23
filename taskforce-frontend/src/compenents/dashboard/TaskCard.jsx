import React from 'react';
import authService from '../../services/authServices';

const TaskCard = ({ task, onShowDeleteModal, onEditTask, onAssignTask, currentUserRole, onShowTaskDetail }) => {

    const handleDragStart = (e) => {
        e.dataTransfer.setData('taskId', task.id);
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            default: return '#6b7280';
        }
    };

    const getPriorityLabel = (priority) => {
        switch (priority) {
            case 'high': return 'Haute';
            case 'medium': return 'Moyenne';
            case 'low': return 'Basse';
            default: return 'Non définie';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div 
            className="task-card"
            draggable
            onDragStart={handleDragStart}
            onClick={() => onShowTaskDetail(task)}
        >
            <div className="task-header">
                <h4 className="task-title">{task.title}</h4>
                <div className="task-actions">
                    
                    {!task.assignedTo && authService.canAccessAdmin(currentUserRole) && (
                        <button 
                            className="btn-assign"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAssignTask(task.id);
                            }}
                            aria-label="Assigner automatiquement cette tâche"
                            title="Assigner automatiquement"
                        >
                            <span aria-hidden="true">🎯</span>
                        </button>
                    )}
                    {authService.canModifyTasks(currentUserRole) && (
                        <button 
                            className="btn-edit"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditTask(task);
                            }}
                            aria-label="Modifier cette tâche"
                            title="Modifier la tâche"
                        >
                            <span aria-hidden="true">✏️</span>
                        </button>
                    )}
                    {authService.canModifyTasks(currentUserRole) && (
                        <button 
                            className="btn-delete"
                            onClick={(e) => {
                                e.stopPropagation();
                                onShowDeleteModal(task);
                            }}
                            aria-label="Supprimer cette tâche"
                            title="Supprimer la tâche"
                        >
                            <span aria-hidden="true">×</span>
                        </button>
                    )}
                </div>
            </div>

            {task.description && (
                <p className="task-description">
                    {task.description.length > 100 
                        ? `${task.description.substring(0, 100)}...` 
                        : task.description
                    }
                </p>
            )}

            <div className="task-meta">
                <div className="task-priority">
                    <span 
                        className="priority-badge"
                        style={{ backgroundColor: getPriorityColor(task.priority) }}
                    >
                        {getPriorityLabel(task.priority)}
                    </span>
                </div>
                
                <div className="task-info">
                    <span className="task-date">
                        {formatDate(task.createdAt)}
                    </span>
                </div>
            </div>

            {task.assignedTo && (
                <div className="task-assignee">
                    <span className="assignee-label">Assigné à :</span>
                    <span className="assignee-name">
                        {task.assignedTo.firstname} {task.assignedTo.lastname}
                    </span>
                </div>
            )}

            {task.requiredSkills && task.requiredSkills.length > 0 && (
                <div className="task-skills">
                    {task.requiredSkills.map(skill => (
                        <span key={skill.id} className="skill-tag">
                            {skill.name}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TaskCard;
