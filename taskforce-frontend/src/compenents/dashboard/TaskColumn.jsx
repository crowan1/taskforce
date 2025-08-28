import React from 'react';
import TaskCard from './TaskCard';

const TaskColumn = ({ column, tasks, onUpdateTaskStatus, onDeleteTask, onShowDeleteModal, onAddSkills, onEditTask, onAssignTask, currentUserRole }) => {
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

    return (
        <div 
            className="task-column"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <div className="column-header" style={{ borderTopColor: column.color }}>
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
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default TaskColumn;
