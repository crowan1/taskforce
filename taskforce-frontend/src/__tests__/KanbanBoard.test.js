import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import KanbanBoard from '../compenents/dashboard/KanbanBoard';
 
jest.mock('../compenents/dashboard/TaskColumn', () => {
    return function MockTaskColumn({ column, tasks, onUpdateTaskStatus, onDeleteTask }) {
        return (
            <div data-testid={`column-${column.id}`}>
                <h3>{column.name}</h3>
                <div data-testid={`tasks-count-${column.id}`}>{tasks.length}</div>
                {tasks.map(task => (
                    <div key={task.id} data-testid={`task-${task.id}`}>
                        {task.title}
                    </div>
                ))}
            </div>
        );
    };
});

const mockColumns = [
    { id: 1, name: 'To Do', identifier: 'todo', position: 0 },
    { id: 2, name: 'In Progress', identifier: 'in_progress', position: 1 },
    { id: 3, name: 'Done', identifier: 'done', position: 2 }
];

const mockTasks = [
    { id: 1, title: 'Task 1', status: 'todo', priority: 'high' },
    { id: 2, title: 'Task 2', status: 'in_progress', priority: 'medium' },
    { id: 3, title: 'Task 3', status: 'done', priority: 'low' },
    { id: 4, title: 'Task 4', column: { id: 1 }, priority: 'high' }
];

const defaultProps = {
    columns: mockColumns,
    tasks: mockTasks,
    onUpdateTaskStatus: jest.fn(),
    onDeleteTask: jest.fn(),
    onShowDeleteModal: jest.fn(),
    onAddSkills: jest.fn(),
    onEditTask: jest.fn(),
    onAssignTask: jest.fn(),
    currentUserRole: 'user',
    onReorderColumns: jest.fn(),
    onShowTaskDetail: jest.fn()
};

describe('KanbanBoard - Vrai composant', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders all columns correctly', () => {
        render(<KanbanBoard {...defaultProps} />);
        
        expect(screen.getByTestId('column-1')).toBeInTheDocument();
        expect(screen.getByTestId('column-2')).toBeInTheDocument();
        expect(screen.getByTestId('column-3')).toBeInTheDocument();
    });

    test('displays column names correctly', () => {
        render(<KanbanBoard {...defaultProps} />);
        
        expect(screen.getByText('To Do')).toBeInTheDocument();
        expect(screen.getByText('In Progress')).toBeInTheDocument();
        expect(screen.getByText('Done')).toBeInTheDocument();
    });

    test('filters tasks correctly by status', () => {
        render(<KanbanBoard {...defaultProps} />);
         
        expect(screen.getByTestId('task-1')).toBeInTheDocument(); 
        expect(screen.getByTestId('task-2')).toBeInTheDocument(); 
        expect(screen.getByTestId('task-3')).toBeInTheDocument();
    });

    test('filters tasks correctly by column id', () => {
        render(<KanbanBoard {...defaultProps} />);
         
        expect(screen.getByTestId('task-4')).toBeInTheDocument();
    });

    test('displays correct task count for each column', () => {
        render(<KanbanBoard {...defaultProps} />);
         
        expect(screen.getByTestId('tasks-count-1')).toHaveTextContent('2');
        expect(screen.getByTestId('tasks-count-2')).toHaveTextContent('1');
        expect(screen.getByTestId('tasks-count-3')).toHaveTextContent('1');
    });

    test('handles empty tasks array', () => {
        render(<KanbanBoard {...defaultProps} tasks={[]} />);
        
        expect(screen.getByTestId('column-1')).toBeInTheDocument();
        expect(screen.getByTestId('tasks-count-1')).toHaveTextContent('0');
        expect(screen.queryByTestId('task-1')).not.toBeInTheDocument();
    });

    test('handles empty columns array', () => {
        render(<KanbanBoard {...defaultProps} columns={[]} />);
        
        expect(screen.queryByTestId('column-1')).not.toBeInTheDocument();
    });

    test('passes correct props to TaskColumn components', () => {
        render(<KanbanBoard {...defaultProps} />);
        

        expect(screen.getByTestId('column-1')).toBeInTheDocument();
        expect(screen.getByTestId('column-2')).toBeInTheDocument();
        expect(screen.getByTestId('column-3')).toBeInTheDocument();
    });

    test('handles tasks with missing status or column properties', () => {
        const tasksWithMissingProps = [
            { id: 1, title: 'Task 1' },  
            { id: 2, title: 'Task 2', status: 'in_progress' }  
        ];
        
        render(<KanbanBoard {...defaultProps} tasks={tasksWithMissingProps} />);
        
        expect(screen.getByTestId('column-1')).toBeInTheDocument();
        expect(screen.getByTestId('column-2')).toBeInTheDocument();
    });
});
