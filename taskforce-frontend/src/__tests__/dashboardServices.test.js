import { dashboardServices } from '../services/dashboard/dashboardServices';

describe('dashboardServices (unit)', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  test('getProjects returns parsed json', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ projects: [] }) });
    const res = await dashboardServices.getProjects();
    expect(res).toEqual({ projects: [] });
  });

  test('getTasks with projectId builds correct URL', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ tasks: [] }) });
    await dashboardServices.getTasks(1);
    expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/tasks?projectId=1', expect.any(Object));
  });

  test('error path throws with message', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({ message: 'fail' }) });
    await expect(dashboardServices.getProjects()).rejects.toThrow('fail');
  });

  test('createProject POSTs body', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ project: { id: 1 } }) });
    await dashboardServices.createProject({ name: 'X' });
    const args = fetch.mock.calls[0];
    expect(args[0]).toContain('/projects');
    expect(args[1].method).toBe('POST');
  });

  test('updateTask PUTs task', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) });
    await dashboardServices.updateTask(1, { status: 'done' });
    const args = fetch.mock.calls[0];
    expect(args[0]).toContain('/tasks/1');
    expect(args[1].method).toBe('PUT');
  });

  test('getColumns calls correct URL', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ columns: [] }) });
    await dashboardServices.getColumns(99);
    expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/columns?projectId=99', expect.any(Object));
  });

  test('deleteProjectSkill uses correct path', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) });
    await dashboardServices.deleteProjectSkill(5);
    const args = fetch.mock.calls[0];
    expect(args[0]).toContain('/projects/skills/5');
    expect(args[1].method).toBe('DELETE');
  });

  test('getProjectWorkload builds URL', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ workload: [] }) });
    await dashboardServices.getProjectWorkload(2);
    expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/tasks/project/2/workload', expect.any(Object));
  });
});


