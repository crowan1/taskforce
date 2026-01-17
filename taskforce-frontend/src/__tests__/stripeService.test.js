import stripeService from '../services/stripeService';

describe('stripeService', () => {
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

  it('gets subscription status', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ is_premium: false })
    });
    const result = await stripeService.getSubscriptionStatus();
    expect(result.is_premium).toBe(false);
  });

  it('redirects on unauthorized', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Unauthorized' })
    });
    await expect(stripeService.getSubscriptionStatus()).rejects.toThrow('Unauthorized');
    expect(window.location.href).toBe('/login');
  });

  it('creates checkout session and subscription', async () => {
    sessionStorage.setItem('token', 'token');
    sessionStorage.setItem('user', JSON.stringify({ id: 1 }));
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    });
    await stripeService.createCheckoutSession();
    await stripeService.createPaymentIntent(1000);
    await stripeService.createSubscription('pm_123');
    await stripeService.cancelSubscription();
    await stripeService.syncSubscription();
  });
});

