import React from 'react';
import TaskColumn from './TaskColumn';

const KanbanBoard = ({ columns, tasks, onUpdateTaskStatus, onDeleteTask, onShowDeleteModal, onAddSkills }) => {
    const getTasksForColumn = (column) => {
        return tasks.filter(task => task.column?.id === column.id || task.status === column.identifier);
    };

    return (
        <div className="kanban-board">
            <div className="kanban-columns">
                {columns.map(column => (
                    <TaskColumn
                        key={column.id}
                        column={column}
                        tasks={getTasksForColumn(column)}
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
