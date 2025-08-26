import React from 'react';
import TaskColumn from './TaskColumn';

const KanbanBoard = ({ columns, tasks, onUpdateTaskStatus, onDeleteTask, onShowDeleteModal, onAddSkills }) => {
    const getTasksForColumn = (columnId) => {
        return tasks.filter(task => task.column?.id === columnId || task.status === columnId);
    };

    return (
        <div className="kanban-board">
            <div className="kanban-columns">
                {columns.map(column => (
                    <TaskColumn
                        key={column.id}
                        column={column}
                        tasks={getTasksForColumn(column.id)}
                        onUpdateTaskStatus={onUpdateTaskStatus}
                        onDeleteTask={onDeleteTask}
                        onShowDeleteModal={onShowDeleteModal}
                        onAddSkills={onAddSkills}
                    />
                ))}
            </div>
        </div>
    );
};

export default KanbanBoard;
