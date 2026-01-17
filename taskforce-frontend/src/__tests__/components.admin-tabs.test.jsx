import { render, screen, fireEvent } from '@testing-library/react';
import AdminTabs from '../compenents/Admin/AdminTabs';

jest.mock('../compenents/Admin/OverviewTab', () => (props) => (
  <div>OverviewTab {props.mode || 'overview'}</div>
));
jest.mock('../compenents/Admin/TasksTab', () => () => <div>TasksTab</div>);
jest.mock('../compenents/Admin/UsersTab', () => () => <div>UsersTab</div>);

describe('AdminTabs', () => {
  it('switches tabs', () => {
    const setActiveTab = jest.fn();
    render(
      <AdminTabs
        activeTab="overview"
        setActiveTab={setActiveTab}
        projectTasks={[]}
        projectUsers={[]}
        onCreateTask={jest.fn()}
        onEditTask={jest.fn()}
        onShowTaskDetail={jest.fn()}
        onReassignTask={jest.fn()}
        onDeleteTask={jest.fn()}
        onAddUser={jest.fn()}
        onUserUpdated={jest.fn()}
        onNavigateToDashboard={jest.fn()}
        selectedProject={{ id: 1 }}
        currentUserRole="manager"
      />
    );
    fireEvent.click(screen.getByText('Gestion des Tâches'));
    expect(setActiveTab).toHaveBeenCalledWith('tasks');
    fireEvent.click(screen.getByText('Gestion des Utilisateurs'));
    expect(setActiveTab).toHaveBeenCalledWith('users');
    fireEvent.click(screen.getByText('Alertes & Notifications'));
    expect(setActiveTab).toHaveBeenCalledWith('alerts');
  });

  it('renders overview and alerts', () => {
    render(
      <AdminTabs
        activeTab="overview"
        setActiveTab={jest.fn()}
        projectTasks={[]}
        projectUsers={[]}
        onCreateTask={jest.fn()}
        onEditTask={jest.fn()}
        onShowTaskDetail={jest.fn()}
        onReassignTask={jest.fn()}
        onDeleteTask={jest.fn()}
        onAddUser={jest.fn()}
        onUserUpdated={jest.fn()}
        onNavigateToDashboard={jest.fn()}
        selectedProject={{ id: 1 }}
        currentUserRole="manager"
      />
    );
    expect(screen.getByText('OverviewTab overview')).toBeInTheDocument();
    render(
      <AdminTabs
        activeTab="alerts"
        setActiveTab={jest.fn()}
        projectTasks={[]}
        projectUsers={[]}
        onCreateTask={jest.fn()}
        onEditTask={jest.fn()}
        onShowTaskDetail={jest.fn()}
        onReassignTask={jest.fn()}
        onDeleteTask={jest.fn()}
        onAddUser={jest.fn()}
        onUserUpdated={jest.fn()}
        onNavigateToDashboard={jest.fn()}
        selectedProject={{ id: 1 }}
        currentUserRole="manager"
      />
    );
    expect(screen.getByText('OverviewTab alerts')).toBeInTheDocument();
  });
});

