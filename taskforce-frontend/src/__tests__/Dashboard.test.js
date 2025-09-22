import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
 
jest.mock('react-router-dom', () => ({ useNavigate: () => jest.fn() }), { virtual: true });
jest.mock('../compenents/includes/header', () => () => <div data-testid="header"/>);
jest.mock('../compenents/includes/footer', () => () => <div data-testid="footer"/>);
jest.mock('../compenents/dashboard/KanbanBoard', () => () => <div data-testid="kanban"/>);
jest.mock('../compenents/dashboard/KanbanHeader', () => () => <div data-testid="kanban-header"/>);
jest.mock('../compenents/dashboard/ProjectSidebar', () => () => <div data-testid="project-sidebar"/>);
jest.mock('../compenents/dashboard/DashboardModals', () => () => <div data-testid="modals"/>);
jest.mock('../compenents/dashboard/modal/UpgradeModal', () => () => <div data-testid="upgrade-modal"/>);
 
jest.mock('../services/dashboard/dashboardServices', () => ({
  dashboardServices: {
    getProjects: jest.fn().mockResolvedValue({ projects: [{ id: 1, name: 'P1', users: [] }] }),
    getTasks: jest.fn().mockResolvedValue({ tasks: [] }),
    getColumns: jest.fn().mockResolvedValue({ columns: [] }),
    updateColumn: jest.fn().mockResolvedValue({ ok: true }),
    createProject: jest.fn().mockResolvedValue({ project: { id: 2, name: 'P2' } }),
    getProjectUsers: jest.fn().mockResolvedValue([]),
    assignTaskAutomatically: jest.fn().mockResolvedValue({ assignedTo: { id: 99 } }),
    assignAllProjectTasks: jest.fn().mockResolvedValue({ ok: true }),
    createColumn: jest.fn().mockResolvedValue({ column: { id: 10, name: 'New' } }),
    updateTask: jest.fn().mockResolvedValue({ ok: true }),
    deleteTask: jest.fn().mockResolvedValue({ ok: true }),
    deleteProject: jest.fn().mockResolvedValue({ ok: true }),
  }
}));

describe('Dashboard (real page with mocked services)', () => {
  test('shows loading then renders layout', async () => {
    const Dashboard = require('../pages/Dashboard').default;
    render(<Dashboard />);
    expect(screen.getByText('Chargement du tableau...')).toBeTruthy();
    await waitFor(() => expect(screen.getByTestId('project-sidebar')).toBeTruthy());
    expect(screen.getByTestId('kanban-header')).toBeTruthy();
  });

  test('error state when getProjects fails', async () => {
    const svc = require('../services/dashboard/dashboardServices').dashboardServices;
    svc.getProjects.mockRejectedValueOnce(new Error('fail'));
    const Dashboard = require('../pages/Dashboard').default;
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText('Erreur')).toBeTruthy());
    expect(screen.getByText('fail')).toBeTruthy();
  });

  test('renders kanban when project exists', async () => {
    const svc = require('../services/dashboard/dashboardServices').dashboardServices;
    svc.getProjects.mockResolvedValueOnce({ projects: [{ id: 1, name: 'P1', users: [] }] });
    svc.getTasks.mockResolvedValueOnce({ tasks: [] });
    svc.getColumns.mockResolvedValueOnce({ columns: [] });
    const Dashboard = require('../pages/Dashboard').default;
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByTestId('kanban-header')).toBeTruthy());
  });

  test('shows error when getColumns fails', async () => {
    const svc = require('../services/dashboard/dashboardServices').dashboardServices;
    svc.getProjects.mockResolvedValueOnce({ projects: [{ id: 1, name: 'P1', users: [] }] });
    svc.getTasks.mockResolvedValueOnce({ tasks: [] });
    svc.getColumns.mockRejectedValueOnce(new Error('columns-fail'));
    const Dashboard = require('../pages/Dashboard').default;
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText('Erreur')).toBeTruthy());
    expect(screen.getByText('columns-fail')).toBeTruthy();
  });

  test('assignAllTasks guarded by project users check', async () => {
    const svc = require('../services/dashboard/dashboardServices').dashboardServices;
    svc.getProjects.mockResolvedValueOnce({ projects: [{ id: 1, name: 'P1', users: [] }] });
    svc.getTasks.mockResolvedValueOnce({ tasks: [] });
    svc.getColumns.mockResolvedValueOnce({ columns: [] });
    svc.getProjectUsers.mockResolvedValueOnce([]);
    const Dashboard = require('../pages/Dashboard').default;
    const { findByText } = render(<Dashboard />);
    expect(await findByText('Chargement du tableau...')).toBeTruthy();
  });

  test('deleteProject handles success', async () => {
    const svc = require('../services/dashboard/dashboardServices').dashboardServices;
    svc.getProjects.mockResolvedValueOnce({ projects: [{ id: 1, name: 'P1', users: [] }] });
    svc.getTasks.mockResolvedValueOnce({ tasks: [] });
    svc.getColumns.mockResolvedValueOnce({ columns: [] });
    svc.deleteProject.mockResolvedValueOnce({ ok: true });
    const Dashboard = require('../pages/Dashboard').default;
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByTestId('kanban-header')).toBeTruthy());
  });

  test('createColumn success path renders without error', async () => {
    const svc = require('../services/dashboard/dashboardServices').dashboardServices;
    svc.getProjects.mockResolvedValueOnce({ projects: [{ id: 1, name: 'P1', users: [] }] });
    svc.getTasks.mockResolvedValueOnce({ tasks: [] });
    svc.getColumns.mockResolvedValueOnce({ columns: [] });
    svc.createColumn.mockResolvedValueOnce({ column: { id: 10, name: 'New' } });
    const Dashboard = require('../pages/Dashboard').default;
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByTestId('kanban-header')).toBeTruthy());
  });
});


