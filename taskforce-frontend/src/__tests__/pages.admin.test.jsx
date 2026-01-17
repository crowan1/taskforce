import { render, screen, waitFor } from '@testing-library/react';
import Admin from '../pages/Admin';
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
    getProfile: jest.fn(),
    getTasks: jest.fn(),
    getProjectUsers: jest.fn(),
    deleteTask: jest.fn(),
    updateTask: jest.fn()
  }
}));

jest.mock('../services/authServices', () => ({
  isAuthenticated: jest.fn(),
  canAccessAdminGlobally: jest.fn(),
  getAdminAccessibleProjects: jest.fn(),
  getUserRoleInProject: jest.fn()
}));

jest.mock('../compenents/dashboard/modal/tasks/CreateTaskModal', () => () => <div>CreateTaskModal</div>);
jest.mock('../compenents/dashboard/modal/tasks/TaskModal', () => () => <div>TaskModal</div>);
jest.mock('../compenents/Admin/AddUserModal', () => () => <div>AddUserModal</div>);
jest.mock('../compenents/Admin/ReassignTaskModal', () => () => <div>ReassignTaskModal</div>);

describe('Admin page', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    authService.isAuthenticated.mockReset();
    authService.canAccessAdminGlobally.mockReset();
    authService.getAdminAccessibleProjects.mockReset();
    authService.getUserRoleInProject.mockReset();
    dashboardServices.getProjects.mockReset();
    dashboardServices.getProfile.mockReset();
    dashboardServices.getTasks.mockReset();
    dashboardServices.getProjectUsers.mockReset();
  });

  it('renders admin tabs when user has access', async () => {
    authService.isAuthenticated.mockResolvedValueOnce(true);
    dashboardServices.getProjects.mockResolvedValueOnce({
      projects: [{ id: 1, name: 'Projet Admin', users: [{ id: 5, role: 'manager' }] }]
    });
    dashboardServices.getProfile.mockResolvedValueOnce({ id: 5 });
    authService.canAccessAdminGlobally.mockReturnValue(true);
    authService.getAdminAccessibleProjects.mockReturnValue([{ id: 1, name: 'Projet Admin', users: [{ id: 5, role: 'manager' }] }]);
    authService.getUserRoleInProject.mockReturnValue('manager');
    dashboardServices.getTasks.mockResolvedValueOnce({ tasks: [] });
    dashboardServices.getProjectUsers.mockResolvedValueOnce({ users: [] });
    render(<Admin />);
    await waitFor(() => expect(screen.getByText('Vue d\'ensemble')).toBeInTheDocument());
  });
});

