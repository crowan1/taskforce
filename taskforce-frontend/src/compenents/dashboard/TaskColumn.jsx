import React from 'react';
import TaskCard from './TaskCard';

const TaskColumn = ({ column, tasks, onUpdateTaskStatus, onDeleteTask, onShowDeleteModal, onAddSkills, onEditTask, onAssignTask, currentUserRole, onReorder, onShowTaskDetail }) => {
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
    };

    const handleHeaderDragOver = (e) => {
        e.preventDefault();
    };

    const handleHeaderDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
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
            className="task-column"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <div 
                className="column-header" 
                style={{ borderTopColor: column.color }}
                draggable
                onDragStart={handleHeaderDragStart}
                onDragOver={handleHeaderDragOver}
                onDrop={handleHeaderDrop}
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
