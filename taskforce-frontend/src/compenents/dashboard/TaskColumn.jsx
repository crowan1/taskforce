import React, { useState } from 'react';
import TaskCard from './TaskCard';

const TaskColumn = ({ column, tasks, onUpdateTaskStatus, onDeleteTask, onShowDeleteModal, onAddSkills, onEditTask, onAssignTask, currentUserRole, onReorder, onShowTaskDetail }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        if (taskId) {
            onUpdateTaskStatus(parseInt(taskId), column.identifier);
        }
    };

    //  drag & drop des colonnes 
    const handleHeaderDragStart = (e) => {
        e.dataTransfer.setData('columnId', String(column.id));
        e.dataTransfer.effectAllowed = 'move';
        setIsDragging(true);
    };

    const handleHeaderDragEnd = (e) => {
        setIsDragging(false);
    };

    const handleHeaderDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsDragOver(true);
    };

    const handleHeaderDragLeave = (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsDragOver(false);
        }
    };

    const handleHeaderDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        
        const draggedColumnId = e.dataTransfer.getData('columnId');
        const draggedTaskId = e.dataTransfer.getData('taskId');
        if (draggedTaskId) {
            return;
        }
        if (draggedColumnId && onReorder) {
            const draggedId = parseInt(draggedColumnId);
            if (!Number.isNaN(draggedId) && draggedId !== column.id) {
                onReorder(draggedId, column.id);
            }
        }
    };

    return (
        <div 
            className={`task-column ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <div 
                className={`column-header ${isDragging ? 'dragging' : ''}`}
                style={{ borderTopColor: column.color }}
                draggable
                onDragStart={handleHeaderDragStart}
                onDragEnd={handleHeaderDragEnd}
                onDragOver={handleHeaderDragOver}
                onDragLeave={handleHeaderDragLeave}
                onDrop={handleHeaderDrop}
                title="Glisser pour réorganiser la colonne"
            >
                <div className="column-title">
                    <h3>{column.name}</h3>
                    <span className="task-count">{tasks.length}</span>
                </div>
                <p className="column-description">{column.description}</p>
            </div>
            
            <div className="column-content">
                {tasks.length === 0 ? (
                    <div className="empty-column">
                        <p>Aucune tâche</p>
                    </div>
                ) : (
                    tasks.map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onDeleteTask={onDeleteTask}
                            onShowDeleteModal={onShowDeleteModal}
                            onAddSkills={onAddSkills}
                            onEditTask={onEditTask}
                            onAssignTask={onAssignTask}
                            currentUserRole={currentUserRole}
                            onShowTaskDetail={onShowTaskDetail}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default TaskColumn;
