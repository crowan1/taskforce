import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '../pages/Dashboard';
import { dashboardServices } from '../services/dashboard/dashboardServices';
import authService from '../services/authServices';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/' })
  };
});

jest.mock('../services/dashboard/dashboardServices', () => ({
  dashboardServices: {
    getProjects: jest.fn(),
    getTasks: jest.fn(),
    getColumns: jest.fn(),
    updateColumn: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    createProject: jest.fn(),
    createColumn: jest.fn()
  }
}));

jest.mock('../services/authServices', () => ({
  canAccessAdmin: jest.fn(() => true),
  canModifyTasks: jest.fn(() => true),
  canManageProject: jest.fn(() => true),
  setCurrentUserRole: jest.fn()
}));

jest.mock('../compenents/dashboard/DashboardModals', () => () => <div>DashboardModals</div>);
jest.mock('../compenents/dashboard/modal/UpgradeModal', () => () => <div>UpgradeModal</div>);

describe('Dashboard page', () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockNavigate.mockReset();
    dashboardServices.getProjects.mockReset();
    dashboardServices.getTasks.mockReset();
    dashboardServices.getColumns.mockReset();
    authService.setCurrentUserRole.mockReset();
  });

  it('loads projects and renders board', async () => {
    sessionStorage.setItem('user', JSON.stringify({ id: 1 }));
    dashboardServices.getProjects.mockResolvedValue({
      projects: [{ id: 1, name: 'Projet Alpha', description: 'Desc', users: [{ id: 1, role: 'manager' }] }]
    });
    dashboardServices.getTasks.mockResolvedValue({ tasks: [] });
    dashboardServices.getColumns.mockResolvedValue({ columns: [] });
    render(<Dashboard />);
    const matches = await screen.findAllByText('Projet Alpha');
    expect(matches.length).toBeGreaterThan(0);
  });
});

