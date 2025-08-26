import React, { useState } from 'react';

const TaskCard = ({ task, onDeleteTask, onShowDeleteModal, onAddSkills }) => {
    const [showDetails, setShowDetails] = useState(false);

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
            onClick={() => setShowDetails(!showDetails)}
        >
            <div className="task-header">
                <h4 className="task-title">{task.title}</h4>
                <div className="task-actions">
                    <button 
                        className="btn-skills"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddSkills(task);
                        }}
                        title="Ajouter des compétences"
                    >
                        🎯
                    </button>
                    <button 
                        className="btn-delete"
                        onClick={(e) => {
                            e.stopPropagation();
                            onShowDeleteModal(task);
                        }}
                    >
                        ×
                    </button>
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

            {showDetails && (
                <div className="task-details">
                    <div className="detail-item">
                        <strong>Créé par :</strong> {task.createdBy.firstname} {task.createdBy.lastname}
                    </div>
                    <div className="detail-item">
                        <strong>Projet :</strong> {task.project.name}
                    </div>
                    <div className="detail-item">
                        <strong>Dernière modification :</strong> {formatDate(task.updatedAt)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskCard;
