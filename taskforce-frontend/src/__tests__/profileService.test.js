jest.mock('axios', () => {
  const client = { get: jest.fn(), put: jest.fn(), interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } } };
  const create = jest.fn(() => client);
  return { __esModule: true, default: { create }, __client: client };
});

describe('profileService (unit)', () => {
  test('getProfile returns data', async () => {
    const axiosClient = require('axios').__client;
    axiosClient.get.mockResolvedValueOnce({ data: { id: 1, email: 'a@a.com' } });
    const service = require('../services/profil/profileService').default;
    const res = await service.getProfile();
    expect(res.email).toBe('a@a.com');
  });

  test('updateProfile returns user data', async () => {
    const axiosClient = require('axios').__client;
    axiosClient.put.mockResolvedValueOnce({ data: { user: { id: 1 } } });
    const service = require('../services/profil/profileService').default;
    const res = await service.updateProfile({ firstname: 'John' });
    expect(res).toEqual({ id: 1 });
  });
});


