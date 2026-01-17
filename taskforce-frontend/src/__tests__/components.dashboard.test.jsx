import { render, screen, fireEvent } from '@testing-library/react';
import ProjectSidebar from '../compenents/dashboard/ProjectSidebar';
import KanbanHeader from '../compenents/dashboard/KanbanHeader';
import KanbanBoard from '../compenents/dashboard/KanbanBoard';
import TaskColumn from '../compenents/dashboard/TaskColumn';
import TaskCard from '../compenents/dashboard/TaskCard';
import authService from '../services/authServices';

jest.mock('../services/authServices', () => ({
  canModifyTasks: jest.fn()
}));

describe('Dashboard components', () => {
  it('toggles project sidebar', () => {
    const setSidebarOpen = jest.fn();
    render(
      <ProjectSidebar
        sidebarOpen={true}
        setSidebarOpen={setSidebarOpen}
        projects={[]}
        selectedProject={null}
        setSelectedProject={jest.fn()}
        setShowCreateProject={jest.fn()}
        isCreator={jest.fn()}
      />
    );
    fireEvent.click(screen.getByText('◀'));
    expect(setSidebarOpen).toHaveBeenCalledWith(false);
  });

  it('renders kanban header with project info', () => {
    const setShowDescriptionModal = jest.fn();
    render(
      <KanbanHeader
        selectedProject={{ name: 'A'.repeat(60), description: 'B'.repeat(120) }}
        currentUserRole="manager"
        showColumnActionsMenu={false}
        setShowColumnActionsMenu={jest.fn()}
        setShowCreateColumn={jest.fn()}
        setShowSelectColumnToEditModal={jest.fn()}
        setShowSelectColumnToDeleteModal={jest.fn()}
        setShowDeleteProjectModal={jest.fn()}
        setShowCreateTask={jest.fn()}
        setShowDescriptionModal={setShowDescriptionModal}
        isManager={jest.fn(() => true)}
        canDeleteColumns={jest.fn(() => true)}
        canDeleteProject={jest.fn(() => true)}
        canCreateTasks={jest.fn(() => true)}
      />
    );
    fireEvent.click(screen.getByText(/A{50}\.\.\./));
    expect(setShowDescriptionModal).toHaveBeenCalledWith(true);
  });

  it('renders kanban header without project', () => {
    render(
      <KanbanHeader
        selectedProject={null}
        currentUserRole={null}
        showColumnActionsMenu={false}
        setShowColumnActionsMenu={jest.fn()}
        setShowCreateColumn={jest.fn()}
        setShowSelectColumnToEditModal={jest.fn()}
        setShowSelectColumnToDeleteModal={jest.fn()}
        setShowDeleteProjectModal={jest.fn()}
        setShowCreateTask={jest.fn()}
        setShowDescriptionModal={jest.fn()}
        isManager={jest.fn(() => false)}
        canDeleteColumns={jest.fn(() => false)}
        canDeleteProject={jest.fn(() => false)}
        canCreateTasks={jest.fn(() => false)}
      />
    );
    expect(screen.getByText('Bienvenue sur TaskForce')).toBeInTheDocument();
  });

  it('opens column actions menu', () => {
    const setShowCreateColumn = jest.fn();
    const setShowColumnActionsMenu = jest.fn();
    render(
      <KanbanHeader
        selectedProject={{ name: 'Project', description: '' }}
        currentUserRole="responsable_projet"
        showColumnActionsMenu={true}
        setShowColumnActionsMenu={setShowColumnActionsMenu}
        setShowCreateColumn={setShowCreateColumn}
        setShowSelectColumnToEditModal={jest.fn()}
        setShowSelectColumnToDeleteModal={jest.fn()}
        setShowDeleteProjectModal={jest.fn()}
        setShowCreateTask={jest.fn()}
        setShowDescriptionModal={jest.fn()}
        isManager={jest.fn(() => true)}
        canDeleteColumns={jest.fn(() => true)}
        canDeleteProject={jest.fn(() => true)}
        canCreateTasks={jest.fn(() => true)}
      />
    );
    fireEvent.click(screen.getByText('Nouvelle Colonne'));
    expect(setShowCreateColumn).toHaveBeenCalledWith(true);
    expect(setShowColumnActionsMenu).toHaveBeenCalledWith(false);
  });

  it('renders kanban board columns', () => {
    render(
      <KanbanBoard
        columns={[{ id: 1, name: 'Todo', identifier: 'todo' }]}
        tasks={[{ id: 10, title: 'Task', status: 'todo' }]}
        onUpdateTaskStatus={jest.fn()}
        onDeleteTask={jest.fn()}
        onShowDeleteModal={jest.fn()}
        onAddSkills={jest.fn()}
        onEditTask={jest.fn()}
        currentUserRole="manager"
        onReorderColumns={jest.fn()}
        onShowTaskDetail={jest.fn()}
      />
    );
    expect(screen.getByText('Todo')).toBeInTheDocument();
  });

  it('handles task drop in column', () => {
    const onUpdateTaskStatus = jest.fn();
    const dataTransfer = {
      getData: jest.fn(() => '2')
    };
    render(
      <TaskColumn
        column={{ id: 1, name: 'Todo', identifier: 'todo', color: '#000', description: '' }}
        tasks={[]}
        onUpdateTaskStatus={onUpdateTaskStatus}
        onDeleteTask={jest.fn()}
        onShowDeleteModal={jest.fn()}
        onAddSkills={jest.fn()}
        onEditTask={jest.fn()}
        currentUserRole="manager"
        onReorder={jest.fn()}
        onShowTaskDetail={jest.fn()}
      />
    );
    fireEvent.drop(screen.getByText('Todo').closest('.task-column'), { dataTransfer });
    expect(onUpdateTaskStatus).toHaveBeenCalledWith(2, 'todo');
  });

  it('reorders columns on header drop', () => {
    const onReorder = jest.fn();
    const dataTransfer = {
      getData: jest.fn((key) => (key === 'columnId' ? '3' : ''))
    };
    render(
      <TaskColumn
        column={{ id: 2, name: 'Doing', identifier: 'doing', color: '#000', description: '' }}
        tasks={[]}
        onUpdateTaskStatus={jest.fn()}
        onDeleteTask={jest.fn()}
        onShowDeleteModal={jest.fn()}
        onAddSkills={jest.fn()}
        onEditTask={jest.fn()}
        currentUserRole="manager"
        onReorder={onReorder}
        onShowTaskDetail={jest.fn()}
      />
    );
    fireEvent.drop(screen.getByText('Doing').closest('.column-header'), { dataTransfer });
    expect(onReorder).toHaveBeenCalledWith(3, 2);
  });

  it('shows delete action in task card', () => {
    authService.canModifyTasks.mockReturnValue(true);
    const onShowDeleteModal = jest.fn();
    render(
      <TaskCard
        task={{
          id: 1,
          title: 'Task',
          createdAt: new Date().toISOString(),
          priority: 'high',
          requiredSkills: []
        }}
        onShowDeleteModal={onShowDeleteModal}
        onEditTask={jest.fn()}
        currentUserRole="responsable_projet"
        onShowTaskDetail={jest.fn()}
      />
    );
    fireEvent.click(screen.getByLabelText('Supprimer cette tâche'));
    expect(onShowDeleteModal).toHaveBeenCalled();
  });

  it('renders task card details', () => {
    authService.canModifyTasks.mockReturnValue(false);
    const onShowTaskDetail = jest.fn();
    render(
      <TaskCard
        task={{
          id: 1,
          title: 'Task',
          description: 'x'.repeat(120),
          createdAt: new Date().toISOString(),
          priority: 'low',
          assignedTo: { firstname: 'Ada', lastname: 'Lovelace' },
          requiredSkills: [{ id: 1, name: 'React' }]
        }}
        onShowDeleteModal={jest.fn()}
        onEditTask={jest.fn()}
        currentUserRole="collaborateur"
        onShowTaskDetail={onShowTaskDetail}
      />
    );
    fireEvent.click(screen.getByText('Task'));
    expect(onShowTaskDetail).toHaveBeenCalled();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
  });
});

