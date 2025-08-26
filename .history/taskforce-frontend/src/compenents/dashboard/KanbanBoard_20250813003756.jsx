import React from 'react';
import TaskColumn from './TaskColumn';

const KanbanBoard = ({ tasks, onUpdateTaskStatus, onDeleteTask }) => {
    const columns = [
        {
            id: 'backlog',
            title: 'Backlog',
            color: '#6b7280',
            description: 'Tâches à planifier'
        },
        {
            id: 'todo',
            title: 'À faire',
            color: '#3b82f6',
            description: 'Tâches prêtes à commencer'
        },
        {
            id: 'in-progress',
            title: 'En cours',
            color: '#f59e0b',
            description: 'Tâches en cours de réalisation'
        },
        {
            id: 'review',
            title: 'En révision',
            color: '#8b5cf6',
            description: 'Tâches en attente de validation'
        },
        {
            id: 'done',
            title: 'Terminé',
            color: '#10b981',
            description: 'Tâches finalisées'
        }
    ];

    const getTasksForColumn = (columnId) => {
        return tasks.filter(task => task.status === columnId);
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
                    />
                ))}
            </div>
        </div>
    );
};

export default KanbanBoard;
