import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TasksTab from '../compenents/Admin/TasksTab';

const mockProjectTasks = [
    { 
        id: 1, 
        title: 'Task 1', 
        status: 'todo', 
        priority: 'high', 
        assignedUser: { firstname: 'John', lastname: 'Doe' },
        estimatedHours: 5,
        skills: [{ name: 'React', level: 'intermediate' }]
    },
    { 
        id: 2, 
        title: 'Task 2', 
        status: 'in_progress', 
        priority: 'medium', 
        assignedUser: { firstname: 'Jane', lastname: 'Smith' },
        estimatedHours: 3,
        skills: []
    },
    { 
        id: 3, 
        title: 'Task 3', 
        status: 'done', 
        priority: 'low', 
        assignedUser: null,
        estimatedHours: 2,
        skills: []
    }
];

const defaultProps = {
    projectTasks: mockProjectTasks,
    onCreateTask: jest.fn(),
    onReassignTask: jest.fn(),
    onEditTask: jest.fn(),
    onShowTaskDetail: jest.fn(),
    onDeleteTask: jest.fn()
};

describe('TasksTab - Vrai composant', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders without crashing', () => {
        render(<TasksTab {...defaultProps} />);
        expect(screen.getByText('Gestion des Tâches')).toBeInTheDocument();
    });

    test('displays create task button', () => {
        render(<TasksTab {...defaultProps} />);
        expect(screen.getByText('Créer une nouvelle tâche')).toBeInTheDocument();
    });

    test('calls onCreateTask when create button is clicked', () => {
        render(<TasksTab {...defaultProps} />);
        
        const createButton = screen.getByText('Créer une nouvelle tâche');
        fireEvent.click(createButton);
        
        expect(defaultProps.onCreateTask).toHaveBeenCalledTimes(1);
    });

    test('displays project tasks section', () => {
        render(<TasksTab {...defaultProps} />);
        expect(screen.getByText('Tâches du projet')).toBeInTheDocument();
    });

    test('displays all tasks', () => {
        render(<TasksTab {...defaultProps} />);
        
        expect(screen.getByText('Task 1')).toBeInTheDocument();
        expect(screen.getByText('Task 2')).toBeInTheDocument();
        expect(screen.getByText('Task 3')).toBeInTheDocument();
    });

    test('displays task priorities', () => {
        render(<TasksTab {...defaultProps} />);
        
        expect(screen.getByText('high')).toBeInTheDocument();
        expect(screen.getByText('medium')).toBeInTheDocument();
        expect(screen.getByText('low')).toBeInTheDocument();
    });

    test('displays assigned users', () => {
        render(<TasksTab {...defaultProps} />);
         
        expect(screen.getByText('Task 1')).toBeInTheDocument();
        expect(screen.getByText('Task 2')).toBeInTheDocument();
        expect(screen.getByText('Task 3')).toBeInTheDocument();
    });

    test('displays estimated hours', () => {
        render(<TasksTab {...defaultProps} />);
         
        expect(screen.getByText('Task 1')).toBeInTheDocument();
        expect(screen.getByText('Task 2')).toBeInTheDocument();
        expect(screen.getByText('Task 3')).toBeInTheDocument();
    });

    test('handles empty tasks list', () => {
        render(<TasksTab {...defaultProps} projectTasks={[]} />);
        expect(screen.getByText('Aucune tâche trouvée dans ce projet.')).toBeInTheDocument();
    });

    test('handles tasks with missing assigned user', () => {
        render(<TasksTab {...defaultProps} />);
        expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    test('displays task skills', () => {
        render(<TasksTab {...defaultProps} />);
        expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    test('handles tasks without skills', () => {
        render(<TasksTab {...defaultProps} />);
        expect(screen.getByText('Task 2')).toBeInTheDocument();
        expect(screen.getByText('Task 3')).toBeInTheDocument();
    });

    test('handles undefined projectTasks', () => {
        render(<TasksTab {...defaultProps} projectTasks={[]} />);
        expect(screen.getByText('Gestion des Tâches')).toBeInTheDocument();
    });

    test('handles null projectTasks', () => {
        render(<TasksTab {...defaultProps} projectTasks={[]} />);
        expect(screen.getByText('Gestion des Tâches')).toBeInTheDocument();
    });
});
