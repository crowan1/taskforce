import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateProjectModal from '../compenents/dashboard/modal/project/CreateProjectModal';
import DeleteProjectModal from '../compenents/dashboard/modal/project/DeleteProjectModal';
import DescriptionModal from '../compenents/dashboard/modal/project/DescriptionModal';
import CreateColumnModal from '../compenents/dashboard/modal/columns/CreateColumnModal';
import AddColumnAfterModal from '../compenents/dashboard/modal/columns/AddColumnAfterModal';
import EditColumnModal from '../compenents/dashboard/modal/columns/EditColumnModal';
import SelectColumnToDeleteModal from '../compenents/dashboard/modal/columns/SelectColumnToDeleteModal';
import SelectColumnToEditModal from '../compenents/dashboard/modal/columns/SelectColumnToEditModal';
import AddSkillsModal from '../compenents/dashboard/modal/tasks/AddSkillsModal';
import ManageUsersModal from '../compenents/dashboard/modal/ManageUsersModal';
import CreateTaskModal from '../compenents/dashboard/modal/tasks/CreateTaskModal';
import TaskModal from '../compenents/dashboard/modal/tasks/TaskModal';
import ModalManager from '../compenents/dashboard/modal/ModalManager';
import DashboardModals from '../compenents/dashboard/DashboardModals';

const mockGetSkills = jest.fn();
const mockAddSkillsToTask = jest.fn();
const mockGetUsers = jest.fn();
const mockAddUserToProject = jest.fn();
const mockUpdateUserRole = jest.fn();
const mockRemoveUserFromProject = jest.fn();
const mockGetAllAvailableProjectSkills = jest.fn();
const mockGetColumns = jest.fn();
const mockCreateTask = jest.fn();
const mockCreateSkill = jest.fn();
const mockCreateProjectSkill = jest.fn();
const mockDeleteProjectSkill = jest.fn();
const mockUploadTaskImage = jest.fn();
const mockDeleteTaskImage = jest.fn();
const mockFinishTask = jest.fn();

jest.mock('../services/dashboard/dashboardServices', () => ({
  dashboardServices: {
    getSkills: (...args) => mockGetSkills(...args),
    addSkillsToTask: (...args) => mockAddSkillsToTask(...args),
    getUsers: (...args) => mockGetUsers(...args),
    addUserToProject: (...args) => mockAddUserToProject(...args),
    updateUserRole: (...args) => mockUpdateUserRole(...args),
    removeUserFromProject: (...args) => mockRemoveUserFromProject(...args),
    getAllAvailableProjectSkills: (...args) => mockGetAllAvailableProjectSkills(...args),
    getColumns: (...args) => mockGetColumns(...args),
    createTask: (...args) => mockCreateTask(...args),
    createSkill: (...args) => mockCreateSkill(...args),
    createProjectSkill: (...args) => mockCreateProjectSkill(...args),
    deleteProjectSkill: (...args) => mockDeleteProjectSkill(...args),
    uploadTaskImage: (...args) => mockUploadTaskImage(...args),
    deleteTaskImage: (...args) => mockDeleteTaskImage(...args),
    finishTask: (...args) => mockFinishTask(...args)
  }
}));

const mockCanModifyTasks = jest.fn(() => true);

jest.mock('../services/authServices', () => ({
  canModifyTasks: (...args) => mockCanModifyTasks(...args)
}));

describe('Dashboard modal components', () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockCanModifyTasks.mockReturnValue(true);
    mockGetSkills.mockReset();
    mockAddSkillsToTask.mockReset();
    mockGetUsers.mockReset();
    mockAddUserToProject.mockReset();
    mockUpdateUserRole.mockReset();
    mockRemoveUserFromProject.mockReset();
    mockGetAllAvailableProjectSkills.mockReset();
    mockGetColumns.mockReset();
    mockCreateTask.mockReset();
    mockCreateSkill.mockReset();
    mockCreateProjectSkill.mockReset();
    mockDeleteProjectSkill.mockReset();
    mockUploadTaskImage.mockReset();
    mockDeleteTaskImage.mockReset();
    mockFinishTask.mockReset();
  });

  it('creates project', () => {
    const onCreateProject = jest.fn();
    render(<CreateProjectModal onClose={jest.fn()} onCreateProject={onCreateProject} />);
    fireEvent.change(screen.getByLabelText('Nom du projet *'), { target: { value: 'Projet X' } });
    fireEvent.submit(screen.getByText('Créer le projet').closest('form'));
    expect(onCreateProject).toHaveBeenCalled();
  });

  it('confirms delete project', () => {
    const onConfirm = jest.fn();
    render(<DeleteProjectModal onClose={jest.fn()} onConfirm={onConfirm} project={{ name: 'P1' }} />);
    fireEvent.click(screen.getByText('Supprimer définitivement'));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('renders description modal', () => {
    render(<DescriptionModal isOpen={true} onClose={jest.fn()} title="Projet" description="Desc" />);
    expect(screen.getByText('Projet')).toBeInTheDocument();
  });

  it('creates column', () => {
    const onCreateColumn = jest.fn();
    render(<CreateColumnModal onClose={jest.fn()} onCreateColumn={onCreateColumn} />);
    fireEvent.change(screen.getByLabelText('Nom de la colonne *'), { target: { value: 'Todo' } });
    fireEvent.submit(screen.getByText('Créer la colonne').closest('form'));
    expect(onCreateColumn).toHaveBeenCalled();
  });

  it('creates column after another', () => {
    const onCreateColumn = jest.fn();
    render(
      <AddColumnAfterModal
        isOpen={true}
        onClose={jest.fn()}
        columnToAddAfter={{ id: 1, name: 'Todo' }}
        onCreateColumn={onCreateColumn}
      />
    );
    fireEvent.change(screen.getByLabelText('Nom de la colonne'), { target: { value: 'After' } });
    fireEvent.change(screen.getByLabelText('Identifiant'), { target: { value: 'after' } });
    fireEvent.submit(screen.getByText('Créer la colonne').closest('form'));
    expect(onCreateColumn).toHaveBeenCalled();
  });

  it('edits column', () => {
    const onUpdateColumn = jest.fn();
    render(
      <EditColumnModal
        isOpen={true}
        onClose={jest.fn()}
        column={{ id: 1, name: 'Todo', description: '', color: '#000' }}
        onUpdateColumn={onUpdateColumn}
      />
    );
    fireEvent.submit(screen.getByText('Modifier').closest('form'));
    expect(onUpdateColumn).toHaveBeenCalledWith(1, expect.any(Object));
  });

  it('selects column to delete', () => {
    const onSelectColumn = jest.fn();
    render(
      <SelectColumnToDeleteModal
        isOpen={true}
        onClose={jest.fn()}
        columns={[{ id: 1, name: 'Todo', color: '#000' }]}
        onSelectColumn={onSelectColumn}
      />
    );
    fireEvent.click(screen.getByText('Sélectionner'));
    expect(onSelectColumn).toHaveBeenCalled();
  });

  it('selects column to edit', () => {
    const onSelectColumn = jest.fn();
    render(
      <SelectColumnToEditModal
        isOpen={true}
        onClose={jest.fn()}
        columns={[{ id: 2, name: 'Doing', color: '#000' }]}
        onSelectColumn={onSelectColumn}
      />
    );
    fireEvent.click(screen.getByText('Sélectionner'));
    expect(onSelectColumn).toHaveBeenCalled();
  });

  it('adds skills to task', async () => {
    mockGetSkills.mockResolvedValueOnce({ skills: [{ id: 1, name: 'React', category: 'Front' }] });
    mockAddSkillsToTask.mockResolvedValueOnce({});
    const onAddSkills = jest.fn();
    render(<AddSkillsModal onClose={jest.fn()} onAddSkills={onAddSkills} taskId={1} />);
    await waitFor(() => expect(screen.getByText('React')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.submit(screen.getByText(/Ajouter 1 compétence/).closest('form'));
    await waitFor(() => expect(mockAddSkillsToTask).toHaveBeenCalled());
    expect(onAddSkills).toHaveBeenCalledWith([1]);
  });

  it('manages users modal', async () => {
    sessionStorage.setItem('user', JSON.stringify({ id: 1 }));
    mockGetUsers.mockResolvedValueOnce({ users: [] });
    mockAddUserToProject.mockResolvedValueOnce({ user: { id: 2, firstname: 'Bob', lastname: 'Lee', role: 'collaborateur' } });
    render(
      <ManageUsersModal
        onClose={jest.fn()}
        onUserUpdated={jest.fn()}
        project={{ id: 1, users: [{ id: 1, role: 'manager', firstname: 'Ada', lastname: 'Lovelace' }] }}
      />
    );
    fireEvent.click(screen.getByText(/Ajouter un utilisateur/));
    fireEvent.change(screen.getByPlaceholderText('exemple@email.com'), { target: { value: 'bob@test.com' } });
    fireEvent.submit(screen.getByText('Ajouter').closest('form'));
    await waitFor(() => expect(mockAddUserToProject).toHaveBeenCalled());
  });

  it('creates task via CreateTaskModal', async () => {
    sessionStorage.setItem('user', JSON.stringify({ id: 1 }));
    mockGetAllAvailableProjectSkills
      .mockResolvedValueOnce({ skills: [] })
      .mockResolvedValueOnce({ hasUsers: true, skills: [] });
    mockGetColumns.mockResolvedValueOnce({ columns: [{ id: 1, name: 'Todo', identifier: 'todo' }] });
    mockCreateTask.mockResolvedValueOnce({ success: true, task: { id: 9, title: 'New Task' } });
    const onTaskCreated = jest.fn();
    render(
      <CreateTaskModal
        isOpen={true}
        onClose={jest.fn()}
        onTaskCreated={onTaskCreated}
        projectId={1}
      />
    );
    fireEvent.change(screen.getByLabelText('Titre *'), { target: { value: 'New Task' } });
    fireEvent.submit(screen.getByText('Créer la tâche').closest('form'));
    await waitFor(() => expect(mockCreateTask).toHaveBeenCalled());
    expect(onTaskCreated).toHaveBeenCalled();
  });

  it('edits task via TaskModal', async () => {
    sessionStorage.setItem('user', JSON.stringify({ id: 1, role: 'responsable_projet' }));
    mockGetAllAvailableProjectSkills.mockResolvedValueOnce({ skills: [] });
    mockGetColumns.mockResolvedValueOnce({ columns: [{ id: 1, name: 'Todo', identifier: 'todo' }] });
    const onTaskUpdate = jest.fn().mockResolvedValueOnce({});
    render(
      <TaskModal
        task={{
          id: 1,
          title: 'Task',
          description: 'Desc',
          priority: 'medium',
          status: 'todo',
          createdAt: new Date().toISOString(),
          requiredSkills: []
        }}
        isOpen={true}
        onClose={jest.fn()}
        onTaskUpdate={onTaskUpdate}
        project={{ id: 1 }}
        mode="view"
        currentUserRole="responsable_projet"
      />
    );
    await waitFor(() => expect(mockGetColumns).toHaveBeenCalled());
    await waitFor(() => expect(mockGetAllAvailableProjectSkills).toHaveBeenCalled());
    fireEvent.click(screen.getByText('Modifier'));
    fireEvent.click(screen.getByText('Enregistrer'));
    await waitFor(() => expect(onTaskUpdate).toHaveBeenCalled());
  });

  it('renders ModalManager create project', () => {
    const onCreateProject = jest.fn();
    render(
      <ModalManager
        showCreateTask={false}
        setShowCreateTask={jest.fn()}
        showCreateProject={true}
        setShowCreateProject={jest.fn()}
        showCreateColumn={false}
        setShowCreateColumn={jest.fn()}
        showEditTask={false}
        setShowEditTask={jest.fn()}
        showManageUsers={false}
        setShowManageUsers={jest.fn()}
        showDeleteProjectModal={false}
        setShowDeleteProjectModal={jest.fn()}
        selectedTask={null}
        setSelectedTask={jest.fn()}
        selectedProject={{ id: 1 }}
        onCreateTask={jest.fn()}
        onCreateProject={onCreateProject}
        onCreateColumn={jest.fn()}
        onUpdateTask={jest.fn()}
        onUserUpdated={jest.fn()}
        onDeleteProject={jest.fn()}
      />
    );
    fireEvent.change(screen.getByLabelText('Nom du projet *'), { target: { value: 'Projet X' } });
    fireEvent.submit(screen.getByText('Créer le projet').closest('form'));
    expect(onCreateProject).toHaveBeenCalled();
  });

  it('confirms delete in DashboardModals', () => {
    const onDeleteTask = jest.fn();
    const setShowDeleteModal = jest.fn();
    const setTaskToDelete = jest.fn();
    render(
      <DashboardModals
        showCreateTask={false}
        setShowCreateTask={jest.fn()}
        showCreateProject={false}
        setShowCreateProject={jest.fn()}
        showCreateColumn={false}
        setShowCreateColumn={jest.fn()}
        showEditTask={false}
        setShowEditTask={jest.fn()}
        showDeleteProjectModal={false}
        setShowDeleteProjectModal={jest.fn()}
        showAddSkills={false}
        setShowAddSkills={jest.fn()}
        showDeleteModal={true}
        setShowDeleteModal={setShowDeleteModal}
        showDeleteColumnModal={false}
        setShowDeleteColumnModal={jest.fn()}
        showEditColumnModal={false}
        setShowEditColumnModal={jest.fn()}
        showSelectColumnToDeleteModal={false}
        setShowSelectColumnToDeleteModal={jest.fn()}
        showSelectColumnToEditModal={false}
        setShowSelectColumnToEditModal={jest.fn()}
        showTaskDetailModal={false}
        setShowTaskDetailModal={jest.fn()}
        showDescriptionModal={false}
        setShowDescriptionModal={jest.fn()}
        selectedTask={null}
        setSelectedTask={jest.fn()}
        selectedProject={{ id: 1, name: 'P', description: 'D' }}
        taskToDelete={{ id: 7, title: 'Task' }}
        setTaskToDelete={setTaskToDelete}
        columnToDelete={null}
        setColumnToDelete={jest.fn()}
        columnToEdit={null}
        setColumnToEdit={jest.fn()}
        selectedTaskForDetail={null}
        setSelectedTaskForDetail={jest.fn()}
        columns={[]}
        currentUserRole="manager"
        onCreateTask={jest.fn()}
        onCreateProject={jest.fn()}
        onCreateColumn={jest.fn()}
        onUpdateTask={jest.fn()}
        onUserUpdated={jest.fn()}
        onDeleteProject={jest.fn()}
        onDeleteTask={onDeleteTask}
        handleUpdateColumn={jest.fn()}
        handleDeleteColumn={jest.fn()}
        handleTaskDetailUpdate={jest.fn()}
        fetchProjects={jest.fn()}
      />
    );
    fireEvent.click(screen.getByText('Supprimer la tâche'));
    expect(onDeleteTask).toHaveBeenCalledWith(7);
    expect(setShowDeleteModal).toHaveBeenCalledWith(false);
    expect(setTaskToDelete).toHaveBeenCalledWith(null);
  });
});

