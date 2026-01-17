import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProjectSelector from '../compenents/Admin/ProjectSelector';
import AddUserModal from '../compenents/Admin/AddUserModal';
import TasksTab from '../compenents/Admin/TasksTab';
import UsersTab from '../compenents/Admin/UsersTab';
import WorkloadBar from '../compenents/Admin/WorkloadBar';
import ReassignTaskModal from '../compenents/Admin/ReassignTaskModal';

const mockCanModifyTasks = jest.fn(() => true);
const mockIsManager = jest.fn(() => false);
const mockCanManageUsers = jest.fn(() => true);

jest.mock('../services/authServices', () => ({
  canModifyTasks: (...args) => mockCanModifyTasks(...args),
  isManager: (...args) => mockIsManager(...args),
  canManageUsers: (...args) => mockCanManageUsers(...args)
}));

const mockAddUserToProject = jest.fn();
const mockUpdateUserRole = jest.fn();
const mockDeleteTask = jest.fn();
const mockUpdateTask = jest.fn();

jest.mock('../services/dashboard/dashboardServices', () => ({
  dashboardServices: {
    addUserToProject: (...args) => mockAddUserToProject(...args),
    updateUserRole: (...args) => mockUpdateUserRole(...args),
    deleteTask: (...args) => mockDeleteTask(...args),
    updateTask: (...args) => mockUpdateTask(...args)
  }
}));

describe('Admin components', () => {
  beforeEach(() => {
    mockAddUserToProject.mockReset();
    mockUpdateUserRole.mockReset();
    mockDeleteTask.mockReset();
    mockUpdateTask.mockReset();
    mockCanModifyTasks.mockReturnValue(true);
    mockIsManager.mockReturnValue(false);
    mockCanManageUsers.mockReturnValue(true);
  });

  it('selects project in ProjectSelector', () => {
    const onProjectChange = jest.fn();
    render(
      <ProjectSelector
        projects={[{ id: 1, name: 'Projet A' }]}
        selectedProject={{ id: 1 }}
        onProjectChange={onProjectChange}
      />
    );
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
    expect(onProjectChange).toHaveBeenCalledWith(1);
  });

  it('submits AddUserModal', async () => {
    const onUserAdded = jest.fn();
    mockAddUserToProject.mockResolvedValueOnce({ success: true });
    render(
      <AddUserModal
        isOpen={true}
        onClose={jest.fn()}
        projectId={1}
        onUserAdded={onUserAdded}
      />
    );
    fireEvent.change(screen.getByLabelText("Email de l'utilisateur *"), {
      target: { value: 'user@test.com' }
    });
    fireEvent.change(screen.getByLabelText('Rôle dans le projet *'), {
      target: { value: 'collaborateur' }
    });
    fireEvent.submit(screen.getByRole('button', { name: "Ajouter l'utilisateur" }).closest('form'));
    await waitFor(() => expect(mockAddUserToProject).toHaveBeenCalled());
    expect(onUserAdded).toHaveBeenCalled();
  });

  it('handles task actions in TasksTab', () => {
    window.confirm = jest.fn(() => true);
    const onDeleteTask = jest.fn();
    render(
      <TasksTab
        projectTasks={[{ id: 1, title: 'T1', description: '', assignedTo: null, createdAt: new Date().toISOString() }]}
        onCreateTask={jest.fn()}
        onReassignTask={jest.fn()}
        onEditTask={jest.fn()}
        onShowTaskDetail={jest.fn()}
        onDeleteTask={onDeleteTask}
        currentUserRole="responsable_projet"
      />
    );
    fireEvent.click(screen.getByTitle('Afficher/Masquer les actions'));
    fireEvent.click(screen.getByText('Supprimer'));
    expect(onDeleteTask).toHaveBeenCalledWith(1);
  });

  it('renders UsersTab and opens user profile', async () => {
    window.confirm = jest.fn(() => true);
    mockCanManageUsers.mockReturnValue(true);
    mockUpdateUserRole.mockResolvedValueOnce({ success: true });
    mockDeleteTask.mockResolvedValueOnce({ success: true });
    render(
      <UsersTab
        projectUsers={[{
          id: 1,
          firstname: 'Ada',
          lastname: 'Lovelace',
          email: 'ada@test.com',
          role: 'manager',
          skills: [],
          joinedAt: new Date().toISOString()
        }]}
        projectTasks={[{
          id: 10,
          title: 'Task',
          description: '',
          status: 'todo',
          priority: 'high',
          createdAt: new Date().toISOString(),
          assignedTo: { id: 1 }
        }]}
        onAddUser={jest.fn()}
        onUserUpdated={jest.fn()}
        selectedProject={{ id: 2 }}
        currentUserRole="responsable_projet"
      />
    );
    fireEvent.click(screen.getAllByText('Ada Lovelace')[0].closest('.user-detailed-item'));
    expect(await screen.findByText('Profil de Ada Lovelace')).toBeInTheDocument();
  });

  it('renders WorkloadBar', () => {
    render(<WorkloadBar currentHours={20} maxHours={40} user={{ firstname: 'Ada', lastname: 'Lovelace' }} />);
    expect(screen.getByText('20h / 40h')).toBeInTheDocument();
  });

  it('reassigns task', async () => {
    const onTaskReassigned = jest.fn();
    mockUpdateTask.mockResolvedValueOnce({ success: true });
    render(
      <ReassignTaskModal
        isOpen={true}
        onClose={jest.fn()}
        task={{ id: 5, title: 'Tache', assignedTo: null }}
        projectUsers={[{ id: 2, firstname: 'Bob', lastname: 'Lee', email: 'b@test.com', role: 'collaborateur' }]}
        projectTasks={[]}
        onTaskReassigned={onTaskReassigned}
      />
    );
    fireEvent.click(screen.getByText('Bob Lee'));
    fireEvent.click(screen.getByText('Confirmer la réassignation'));
    await waitFor(() => expect(mockUpdateTask).toHaveBeenCalled());
    expect(onTaskReassigned).toHaveBeenCalled();
  });
});

