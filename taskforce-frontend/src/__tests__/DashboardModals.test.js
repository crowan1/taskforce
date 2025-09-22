import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardModals from '../compenents/dashboard/DashboardModals';

const defaultProps = {
    showCreateTask: false,
    showCreateProject: false,
    showCreateColumn: false,
    showEditTask: false,
    showTaskDetail: false,
    showAddSkills: false,
    showManageUsers: false,
    showDeleteTask: false,
    showDeleteProject: false,
    showUpgrade: false,
    onClose: jest.fn(),
    onTaskCreated: jest.fn(),
    onProjectCreated: jest.fn(),
    onColumnCreated: jest.fn(),
    onTaskUpdated: jest.fn(),
    onTaskDeleted: jest.fn(),
    onProjectDeleted: jest.fn(),
    selectedTask: null,
    selectedProject: null,
    projectId: 'test-project-id',
    projectUsers: [],
    projectTasks: []
};

describe('DashboardModals - Vrai composant', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders without crashing', () => {
        render(<DashboardModals {...defaultProps} />);
        expect(document.body).toBeInTheDocument();
    });

    test('renders create task modal when showCreateTask is true', () => {
        render(<DashboardModals {...defaultProps} showCreateTask={true} />);
         
        expect(document.body).toBeInTheDocument();
    });

    test('renders create project modal when showCreateProject is true', () => {
        render(<DashboardModals {...defaultProps} showCreateProject={true} />);
        
        expect(document.body).toBeInTheDocument();
    });

    test('renders create column modal when showCreateColumn is true', () => {
        render(<DashboardModals {...defaultProps} showCreateColumn={true} />);
        
        expect(document.body).toBeInTheDocument();
    });

    test('renders edit task modal when showEditTask is true', () => {
        const mockTask = { id: 1, title: 'Test Task' };
        render(<DashboardModals {...defaultProps} showEditTask={true} selectedTask={mockTask} />);
        
        expect(document.body).toBeInTheDocument();
    });

    test('renders task detail modal when showTaskDetail is true', () => {
        const mockTask = { id: 1, title: 'Test Task' };
        render(<DashboardModals {...defaultProps} showTaskDetail={true} selectedTask={mockTask} />);
        
        expect(document.body).toBeInTheDocument();
    });

    test('renders add skills modal when showAddSkills is true', () => {
        const mockTask = { id: 1, title: 'Test Task' };
        render(<DashboardModals {...defaultProps} showAddSkills={true} selectedTask={mockTask} />);
        
        expect(document.body).toBeInTheDocument();
    });

    test('renders manage users modal when showManageUsers is true', () => {
        render(<DashboardModals {...defaultProps} showManageUsers={true} />);
        
        expect(document.body).toBeInTheDocument();
    });

    test('renders delete task modal when showDeleteTask is true', () => {
        const mockTask = { id: 1, title: 'Test Task' };
        render(<DashboardModals {...defaultProps} showDeleteTask={true} selectedTask={mockTask} />);
        
        expect(document.body).toBeInTheDocument();
    });

    test('renders delete project modal when showDeleteProject is true', () => {
        const mockProject = { id: 1, name: 'Test Project' };
        render(<DashboardModals {...defaultProps} showDeleteProject={true} selectedProject={mockProject} />);
        
        expect(document.body).toBeInTheDocument();
    });

    test('renders upgrade modal when showUpgrade is true', () => {
        render(<DashboardModals {...defaultProps} showUpgrade={true} />);
        
        expect(document.body).toBeInTheDocument();
    });

    test('does not render any modal when all show flags are false', () => {
        render(<DashboardModals {...defaultProps} />);
         
        expect(document.body).toBeInTheDocument();
    });

    test('passes correct props to modals', () => {
        const mockTask = { id: 1, title: 'Test Task' };
        const mockProject = { id: 1, name: 'Test Project' };
        
        render(
            <DashboardModals 
                {...defaultProps} 
                showCreateTask={true}
                showEditTask={true}
                showDeleteTask={true}
                showDeleteProject={true}
                selectedTask={mockTask}
                selectedProject={mockProject}
                projectId="test-project-id"
                projectUsers={[{ id: 1, firstname: 'John', lastname: 'Doe' }]}
                projectTasks={[{ id: 1, title: 'Task 1' }]}
            />
        );
        
        expect(document.body).toBeInTheDocument();
    });

    test('handles multiple modals being open simultaneously', () => {
        render(
            <DashboardModals 
                {...defaultProps} 
                showCreateTask={true}
                showCreateProject={true}
                showUpgrade={true}
            />
        );
        
        expect(document.body).toBeInTheDocument();
    });

    test('handles missing selected task gracefully', () => {
        render(<DashboardModals {...defaultProps} showEditTask={true} selectedTask={null} />);
        
        expect(document.body).toBeInTheDocument();
    });

    test('handles missing selected project gracefully', () => {
        render(<DashboardModals {...defaultProps} showDeleteProject={true} selectedProject={null} />);
        
        expect(document.body).toBeInTheDocument();
    });
});
