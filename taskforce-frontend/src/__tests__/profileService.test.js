jest.mock('axios', () => {
  const mockGet = jest.fn();
  const mockPut = jest.fn();
  const mockRequestUse = jest.fn();
  const mockResponseUse = jest.fn();
  return {
    create: jest.fn(() => ({
      get: mockGet,
      put: mockPut,
      interceptors: {
        request: { use: mockRequestUse },
        response: { use: mockResponseUse }
      }
    })),
    __mock: {
      mockGet,
      mockPut,
      mockRequestUse,
      mockResponseUse
    }
  };
});

import axios from 'axios';
import profileService from '../services/profil/profileService';

describe('profileService', () => {
  beforeEach(() => {
    axios.__mock.mockGet.mockReset();
    axios.__mock.mockPut.mockReset();
  });

  it('gets profile', async () => {
    axios.__mock.mockGet.mockResolvedValueOnce({ data: { id: 1 } });
    const result = await profileService.getProfile();
    expect(result.id).toBe(1);
  });

  it('updates profile', async () => {
    axios.__mock.mockPut.mockResolvedValueOnce({ data: { user: { id: 2 } } });
    const result = await profileService.updateProfile({ firstname: 'Ada' });
    expect(result.id).toBe(2);
  });

  it('handles profile errors', async () => {
    axios.__mock.mockGet.mockRejectedValueOnce({ response: { data: 'bad' } });
    await expect(profileService.getProfile()).rejects.toBe('bad');
    axios.__mock.mockPut.mockRejectedValueOnce({ message: 'err' });
    await expect(profileService.updateProfile({})).rejects.toBe('err');
  });
});

