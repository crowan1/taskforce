import stripeService from '../services/stripeService';

describe('stripeService (unit)', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    localStorage.clear();
  });

  test('createPaymentIntent posts amount', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ clientSecret: 'cs' }) });
    const res = await stripeService.createPaymentIntent(999);
    expect(res.clientSecret).toBe('cs');
    const args = fetch.mock.calls[0];
    expect(args[0]).toContain('/stripe/create-payment-intent');
    expect(args[1].method).toBe('POST');
  });

  test('getSubscriptionStatus returns status', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ is_premium: false }) });
    const res = await stripeService.getSubscriptionStatus();
    expect(res.is_premium).toBe(false);
  });

  test('cancelSubscription returns json', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) });
    const res = await stripeService.cancelSubscription();
    expect(res.ok).toBe(true);
  });
});


