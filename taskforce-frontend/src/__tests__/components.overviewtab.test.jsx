import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OverviewTab from '../compenents/Admin/OverviewTab';

const mockGetProjectAlerts = jest.fn();
const mockDismissAlert = jest.fn();

jest.mock('../services/dashboard/dashboardServices', () => ({
  dashboardServices: {
    getProjectAlerts: (...args) => mockGetProjectAlerts(...args),
    dismissAlert: (...args) => mockDismissAlert(...args)
  }
}));

describe('OverviewTab', () => {
  beforeEach(() => {
    mockGetProjectAlerts.mockReset();
    mockDismissAlert.mockReset();
  });

  it('renders stats in overview mode', () => {
    render(
      <OverviewTab
        projectTasks={[{ id: 1 }, { id: 2 }]}
        projectUsers={[{ id: 1 }]}
        onCreateTask={jest.fn()}
        onAddUser={jest.fn()}
        onNavigateToDashboard={jest.fn()}
        selectedProject={{ id: 1 }}
      />
    );
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('loads alerts and dismisses overdue task', async () => {
    mockGetProjectAlerts
      .mockResolvedValueOnce({
        overdueTasks: [{ id: 1, alertId: 10, title: 'Task', assignedTo: null, dueDate: new Date().toISOString() }],
        overloadedUsers: []
      })
      .mockResolvedValueOnce({
        overdueTasks: [],
        overloadedUsers: []
      });
    mockDismissAlert.mockResolvedValueOnce({});
    render(
      <OverviewTab
        projectTasks={[]}
        projectUsers={[]}
        onCreateTask={jest.fn()}
        onAddUser={jest.fn()}
        onNavigateToDashboard={jest.fn()}
        selectedProject={{ id: 1 }}
        mode="alerts"
      />
    );
    await waitFor(() => expect(screen.getByText(/Tâche en retard/)).toBeInTheDocument());
    fireEvent.click(screen.getByTitle('Supprimer cette alerte'));
    await waitFor(() => expect(mockDismissAlert).toHaveBeenCalled());
  });
});

