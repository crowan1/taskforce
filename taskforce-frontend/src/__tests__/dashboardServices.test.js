import { dashboardServices } from '../services/dashboard/dashboardServices';

describe('dashboardServices', () => {
  const originalLocation = window.location;

  beforeAll(() => {
    delete window.location;
    window.location = { href: '' };
  });

  afterAll(() => {
    window.location = originalLocation;
  });

  beforeEach(() => {
    sessionStorage.clear();
    global.fetch = jest.fn();
  });

  it('fetches tasks with and without project id', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ tasks: [] })
    });
    await dashboardServices.getTasks();
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/tasks'), expect.any(Object));
    await dashboardServices.getTasks(12);
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/tasks?projectId=12'), expect.any(Object));
  });

  it('handles unauthorized errors', async () => {
    sessionStorage.setItem('token', 'token');
    global.fetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' })
    });
    await expect(dashboardServices.getProjects()).rejects.toThrow('Unauthorized');
    expect(window.location.href).toBe('/login');
  });

  it('handles server errors', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Boom' })
    });
    await expect(dashboardServices.createProject({ name: 'P' })).rejects.toThrow('Boom');
  });

  it('posts and deletes resources', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    });
    await dashboardServices.createProject({ name: 'P' });
    await dashboardServices.updateProject(1, { name: 'P2' });
    await dashboardServices.deleteProject(1);
    await dashboardServices.addUserToProject(1, 'user@test.com', 'manager');
    await dashboardServices.updateUserRole(1, 2, 'collaborateur');
    await dashboardServices.removeUserFromProject(1, 2);
    await dashboardServices.createColumn({ name: 'Todo' });
    await dashboardServices.updateColumn(3, { name: 'Done' });
    await dashboardServices.deleteColumn(3);
    await dashboardServices.createTask({ title: 'T' });
    await dashboardServices.updateTask(9, { title: 'T2' });
    await dashboardServices.deleteTask(9);
    await dashboardServices.addSkillsToTask(9, [1, 2]);
    await dashboardServices.assignTaskAutomatically(9);
    await dashboardServices.assignAllProjectTasks(1);
    await dashboardServices.getProjectWorkload(1);
    await dashboardServices.getProjectAlerts(1);
    await dashboardServices.dismissAlert(1, { alertType: 'overdue_task', entityId: 10 });
    await dashboardServices.finishTask(9);
    await dashboardServices.getColumns(1);
    await dashboardServices.createSkill({ name: 'React' });
    await dashboardServices.updateSkill(2, { name: 'Vue' });
    await dashboardServices.deleteSkill(2);
    await dashboardServices.getUsers();
    await dashboardServices.getProjectUsers(1);
    await dashboardServices.getProfile();
    await dashboardServices.getUserSkills();
    await dashboardServices.getUserSkillsByUserId(1);
    await dashboardServices.addUserSkill({ name: 'Test' });
    await dashboardServices.updateUserSkill(3, { name: 'Test2' });
    await dashboardServices.deleteUserSkill(3);
    await dashboardServices.getProjectUserSkills(1);
    await dashboardServices.getAllAvailableProjectSkills(1);
    await dashboardServices.createProjectSkill(1, { name: 'Skill' });
    await dashboardServices.deleteProjectSkill(5);
  });

  it('uploads and deletes task image', async () => {
    const mockFile = new File(['x'], 'test.png', { type: 'image/png' });
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, image: 'path.png' })
    });
    await dashboardServices.uploadTaskImage(1, mockFile);
    await dashboardServices.deleteTaskImage(1, 'path.png');
  });
});

