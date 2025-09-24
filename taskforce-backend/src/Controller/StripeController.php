<?php

namespace App\Controller;

use App\Entity\Subscription;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Checkout\Session as CheckoutSession;
use Stripe\Subscription as StripeSubscription;
use Stripe\Customer;
use Stripe\Exception\ApiErrorException;

#[Route('/api/stripe', name: 'stripe_')]
class StripeController extends AbstractController
{
    private EntityManagerInterface $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
        Stripe::setApiKey(getenv('STRIPE_SECRET_KEY') ?: $_ENV['STRIPE_SECRET_KEY']);
    }

    #[Route('/create-payment-intent', name: 'create_payment_intent', methods: ['POST'])]
    public function createPaymentIntent(Request $request): JsonResponse
    {
        try {
            $user = $this->getUser();
            if (!$user) {
                return new JsonResponse(['error' => 'Utilisateur non authentifié'], 401);
            }

            $data = json_decode($request->getContent(), true);
            $amount = $data['amount'] ?? 1000; //10€

            $paymentIntent = PaymentIntent::create([
                'amount' => $amount,
                'currency' => 'eur',
                'metadata' => [
                    'user_id' => $user->getId(),
                    'plan' => 'premium'
                ]
            ]);

            return new JsonResponse([
                'client_secret' => $paymentIntent->client_secret,
                'publishable_key' => getenv('STRIPE_PUBLISHABLE_KEY') ?: $_ENV['STRIPE_PUBLISHABLE_KEY']
            ]);

        } catch (ApiErrorException $e) {
            return new JsonResponse(['error' => $e->getMessage()], 400);
        }
    }

    #[Route('/create-checkout-session', name: 'create_checkout_session', methods: ['POST'])]
    public function createCheckoutSession(Request $request): JsonResponse
    {
        try {
            $user = $this->getUser();
            if (!$user) {
                return new JsonResponse(['error' => 'Utilisateur non authentifié'], 401);
            }

            $frontendBaseUrl = getenv('FRONTEND_BASE_URL') ?: ($_ENV['FRONTEND_BASE_URL'] ?? 'http://localhost:3000');
            $priceId = getenv('STRIPE_PRICE_ID') ?: ($_ENV['STRIPE_PRICE_ID'] ?? null);
            if (!$priceId) {
                return new JsonResponse(['error' => 'STRIPE_PRICE_ID manquant dans la configuration'], 500);
            }

            $customer = $this->getOrCreateStripeCustomer($user);

            $session = CheckoutSession::create([
                'mode' => 'subscription',
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price' => $priceId,
                    'quantity' => 1,
                ]],
                'customer' => $customer->id,
                'success_url' => rtrim($frontendBaseUrl, '/') . '/upgrade?success=true&session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => rtrim($frontendBaseUrl, '/') . '/upgrade?canceled=true',
                'metadata' => [
                    'user_id' => $user->getId(),
                ],
                'client_reference_id' => (string)$user->getId(),
            ]);

            return new JsonResponse([
                'url' => $session->url,
                'id' => $session->id,
            ]);
        } catch (ApiErrorException $e) {
            return new JsonResponse(['error' => $e->getMessage()], 400);
        }
    }

    #[Route('/create-subscription', name: 'create_subscription', methods: ['POST'])]
    public function createSubscription(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            $userId = $data['user_id'] ?? null;
            $paymentMethodId = $data['payment_method_id'] ?? null;
 

            if (!$paymentMethodId) {
                return new JsonResponse(['error' => 'Payment method ID requis'], 400);
            }

            if (!$userId) {
                return new JsonResponse(['error' => 'ID utilisateur requis'], 400);
            }

            $user = $this->entityManager->getRepository(User::class)->find($userId);
            if (!$user) {
                return new JsonResponse(['error' => 'Utilisateur non trouvé'], 404);
            }

            $customer = $this->getOrCreateStripeCustomer($user);
            \Stripe\PaymentMethod::retrieve($paymentMethodId)->attach(['customer' => $customer->id]);
            $subscription = StripeSubscription::create([
                'customer' => $customer->id,
                'items' => [[
                    'price' => getenv('STRIPE_PRICE_ID') ?: 'price_1SAT7p1nyjlp4LhA2vqx9h5L',
                ]],
                'default_payment_method' => $paymentMethodId,
                'payment_behavior' => 'default_incomplete',
                'payment_settings' => ['save_default_payment_method' => 'on_subscription'],
                'expand' => ['latest_invoice.payment_intent'],
            ]);
            $dbSubscription = new Subscription();
            $dbSubscription->setUser($user);
            $dbSubscription->setStripeSubscriptionId($subscription->id);
            $dbSubscription->setStatus('active');
            $dbSubscription->setPlan('premium');
            $dbSubscription->setAmount('10.00');
            $dbSubscription->setCurrency('eur');
            if (isset($subscription->current_period_start)) {
                $dbSubscription->setCurrentPeriodStart(new \DateTimeImmutable('@' . $subscription->current_period_start));
            } else {
                $dbSubscription->setCurrentPeriodStart(new \DateTimeImmutable());
            }
            
            if (isset($subscription->current_period_end)) {
                $dbSubscription->setCurrentPeriodEnd(new \DateTimeImmutable('@' . $subscription->current_period_end));
            } else {
                $dbSubscription->setCurrentPeriodEnd(new \DateTimeImmutable('+1 month'));
            }

            $this->entityManager->persist($dbSubscription);
            $this->entityManager->flush();

            $response = [
                'subscription_id' => $subscription->id,
                'success' => true,
                'message' => 'Abonnement créé avec succès'
            ];

            if (isset($subscription->latest_invoice) && isset($subscription->latest_invoice->payment_intent)) {
                $response['client_secret'] = $subscription->latest_invoice->payment_intent->client_secret;
            }

            return new JsonResponse($response);

        } catch (ApiErrorException $e) {
            return new JsonResponse(['error' => $e->getMessage()], 400);
        }
    }

    #[Route('/subscription-status', name: 'subscription_status', methods: ['GET'])]
    public function getSubscriptionStatus(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur non authentifié'], 401);
        }

        $subscription = $this->entityManager->getRepository(Subscription::class)
            ->findActiveByUser($user);

        return new JsonResponse([
            'is_premium' => $subscription ? $subscription->isPremium() : false,
            'subscription' => $subscription ? [
                'plan' => $subscription->getPlan(),
                'status' => $subscription->getStatus(),
                'amount' => $subscription->getAmount(),
                'currency' => $subscription->getCurrency(),
                'current_period_end' => $subscription->getCurrentPeriodEnd()->format('Y-m-d H:i:s')
            ] : null
        ]);
    }

    #[Route('/cancel-subscription', name: 'cancel_subscription', methods: ['POST'])]
    public function cancelSubscription(): JsonResponse
    {
        try {
            $user = $this->getUser();
            if (!$user) {
                return new JsonResponse(['error' => 'Utilisateur non authentifié'], 401);
            }

            $repo = $this->entityManager->getRepository(Subscription::class);
            $subscription = $repo->findByUser($user);

            $customers = Customer::all(['email' => $user->getEmail()]);
            if (count($customers->data) === 0) {
                return new JsonResponse(['error' => 'Client Stripe introuvable pour cet email'], 404);
            }
            $customer = $customers->data[0];

            $subs = \Stripe\Subscription::all([
                'customer' => $customer->id,
                'status' => 'all',
                'limit' => 20,
            ]);

            $eligibleStatuses = ['active', 'trialing', 'past_due', 'incomplete', 'unpaid'];
            $cancelledAny = false;
            foreach ($subs->data as $sub) {
                if (in_array($sub->status, $eligibleStatuses, true)) {
                    try {
                        $stripeSubscription = \Stripe\Subscription::retrieve($sub->id);
                        $stripeSubscription->cancel();
                        $cancelledAny = true;
                        if (!$subscription) {
                            $subscription = new Subscription();
                            $subscription->setUser($user);
                            $subscription->setPlan('premium');
                            $subscription->setAmount('10.00');
                            $subscription->setCurrency('eur');
                        }
                        $subscription->setStripeSubscriptionId($sub->id);
                        $subscription->setStatus('cancelled');
                        $subscription->setCurrentPeriodStart(new \DateTimeImmutable('@' . ($sub->current_period_start ?? time())));
                        $subscription->setCurrentPeriodEnd(new \DateTimeImmutable('@' . ($sub->current_period_end ?? time())));
                        $this->entityManager->persist($subscription);
                    } catch (ApiErrorException $e) {
                    }
                }
            }

            if (!$cancelledAny) {
                if (count($subs->data) > 0) {
                    $latest = $subs->data[0];
                    if (!$subscription) {
                        $subscription = new Subscription();
                        $subscription->setUser($user);
                        $subscription->setPlan('premium');
                        $subscription->setAmount('10.00');
                        $subscription->setCurrency('eur');
                    }
                    if (isset($latest->id)) {
                        $subscription->setStripeSubscriptionId($latest->id);
                    }
                    $subscription->setStatus('cancelled');
                    if (isset($latest->current_period_start)) {
                        $subscription->setCurrentPeriodStart(new \DateTimeImmutable('@' . $latest->current_period_start));
                    } else {
                        $subscription->setCurrentPeriodStart(new \DateTimeImmutable());
                    }
                    if (isset($latest->current_period_end)) {
                        $subscription->setCurrentPeriodEnd(new \DateTimeImmutable('@' . $latest->current_period_end));
                    } else {
                        $subscription->setCurrentPeriodEnd(new \DateTimeImmutable());
                    }
                    $this->entityManager->persist($subscription);
                    $this->entityManager->flush();
                    return new JsonResponse(['success' => true, 'message' => 'Abonnement déjà annulé côté Stripe. Statut local mis à jour.']);
                }
                return new JsonResponse(['error' => 'Aucun abonnement trouvé pour ce client'], 404);
            }

            $allLocalSubs = $this->entityManager->getRepository(Subscription::class)->findBy(['user' => $user]);
            foreach ($allLocalSubs as $s) {
                $s->setStatus('cancelled');
                $this->entityManager->persist($s);
            }

            $this->entityManager->flush();

            error_log('Subscription cancelled for user: ' . $user->getId());

            return new JsonResponse([
                'success' => true,
                'message' => 'Abonnement annulé avec succès'
            ]);

        } catch (\Exception $e) {
            error_log('Error cancelling subscription: ' . $e->getMessage());
            return new JsonResponse(['error' => 'Erreur lors de l\'annulation de l\'abonnement'], 500);
        }
    }

    #[Route('/sync-subscription', name: 'sync_subscription', methods: ['POST'])]
    public function syncSubscription(): JsonResponse
    {
        try {
            $user = $this->getUser();
            if (!$user) {
                return new JsonResponse(['error' => 'Utilisateur non authentifié'], 401);
            }

            $customers = Customer::all(['email' => $user->getEmail()]);
            if (count($customers->data) === 0) {
                return new JsonResponse(['success' => false, 'message' => 'Aucun client Stripe trouvé pour cet email']);
            }

            $customer = $customers->data[0];

            $subs = \Stripe\Subscription::all([
                'customer' => $customer->id,
                'status' => 'all',
                'limit' => 10,
            ]);

            if (count($subs->data) === 0) {
                return new JsonResponse(['success' => false, 'message' => 'Aucun abonnement Stripe trouvé pour ce client']);
            }

            $stripeSub = null;
            foreach ($subs->data as $sub) {
                if ($sub->status === 'active') {
                    $stripeSub = $sub;
                    break;
                }
            }
            if (!$stripeSub) {
                $stripeSub = $subs->data[0];
            }

            $repo = $this->entityManager->getRepository(Subscription::class);
            $dbSubscription = $repo->findActiveByUser($user) ?: $repo->findByUser($user);
            if (!$dbSubscription) {
                $dbSubscription = new Subscription();
                $dbSubscription->setUser($user);
            }

            $dbSubscription->setStripeSubscriptionId($stripeSub->id);
            $dbSubscription->setStatus($stripeSub->status ?? 'active');
            $dbSubscription->setPlan('premium');
            $dbSubscription->setAmount('10.00');
            $dbSubscription->setCurrency('eur');
            if (isset($stripeSub->current_period_start)) {
                $dbSubscription->setCurrentPeriodStart(new \DateTimeImmutable('@' . $stripeSub->current_period_start));
            } else {
                $dbSubscription->setCurrentPeriodStart(new \DateTimeImmutable());
            }
            if (isset($stripeSub->current_period_end)) {
                $dbSubscription->setCurrentPeriodEnd(new \DateTimeImmutable('@' . $stripeSub->current_period_end));
            } else {
                $dbSubscription->setCurrentPeriodEnd(new \DateTimeImmutable('+1 month'));
            }

            $this->entityManager->persist($dbSubscription);
            $this->entityManager->flush();

            return new JsonResponse([
                'success' => true,
                'is_premium' => $dbSubscription->isPremium(),
                'subscription_id' => $dbSubscription->getStripeSubscriptionId(),
                'status' => $dbSubscription->getStatus(),
            ]);
        } catch (ApiErrorException $e) {
            return new JsonResponse(['error' => $e->getMessage()], 400);
        }
    }

    #[Route('/webhook', name: 'webhook', methods: ['POST'])]
    public function webhook(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sigHeader = $request->headers->get('stripe-signature');
        $endpointSecret = getenv('STRIPE_WEBHOOK_SECRET') ?: ($_ENV['STRIPE_WEBHOOK_SECRET'] ?? '');

        try {
            $event = \Stripe\Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
        } catch (\UnexpectedValueException $e) {
            return new JsonResponse(['error' => 'Invalid payload'], 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            return new JsonResponse(['error' => 'Invalid signature'], 400);
        }

        switch ($event->type) {
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted':
                $this->handleSubscriptionChange($event->data->object);
                break;
            case 'customer.subscription.created':
                $this->handleSubscriptionCreated($event->data->object);
                break;
            case 'checkout.session.completed':
                break;
        }

        return new JsonResponse(['status' => 'success']);
    }

    private function getOrCreateStripeCustomer(User $user): Customer
    { 
        $customers = Customer::all(['email' => $user->getEmail()]);
        
        if (count($customers->data) > 0) {
            return $customers->data[0];
        }
 
        return Customer::create([
            'email' => $user->getEmail(),
            'name' => $user->getFirstname() . ' ' . $user->getLastname(),
            'metadata' => [
                'user_id' => $user->getId()
            ]
        ]);
    }

    private function handleSubscriptionChange($stripeSubscription): void
    {
        $subscription = $this->entityManager->getRepository(Subscription::class)
            ->findOneBy(['stripeSubscriptionId' => $stripeSubscription->id]);

        if ($subscription) {
            $subscription->setStatus($stripeSubscription->status);
            $subscription->setCurrentPeriodStart(new \DateTimeImmutable('@' . $stripeSubscription->current_period_start));
            $subscription->setCurrentPeriodEnd(new \DateTimeImmutable('@' . $stripeSubscription->current_period_end));
            
            $this->entityManager->flush();
        }
    }

    private function handleSubscriptionCreated($stripeSubscription): void
    {
        $existing = $this->entityManager->getRepository(Subscription::class)
            ->findOneBy(['stripeSubscriptionId' => $stripeSubscription->id]);
        if ($existing) {
            return;
        }

        try {
            $stripeCustomer = Customer::retrieve($stripeSubscription->customer);
        } catch (ApiErrorException $e) {
            return;
        }

        $user = null;
        if (isset($stripeCustomer->metadata['user_id'])) {
            $userId = (int)$stripeCustomer->metadata['user_id'];
            $user = $this->entityManager->getRepository(User::class)->find($userId);
        }

        if (!$user && isset($stripeCustomer->email)) {
            $user = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $stripeCustomer->email]);
        }

        if (!$user) {
            return;
        }

        $dbSubscription = new Subscription();
        $dbSubscription->setUser($user);
        $dbSubscription->setStripeSubscriptionId($stripeSubscription->id);
        $dbSubscription->setStatus($stripeSubscription->status ?? 'active');
        $dbSubscription->setPlan('premium');
        $dbSubscription->setAmount('10.00');
        $dbSubscription->setCurrency('eur');
        if (isset($stripeSubscription->current_period_start)) {
            $dbSubscription->setCurrentPeriodStart(new \DateTimeImmutable('@' . $stripeSubscription->current_period_start));
        } else {
            $dbSubscription->setCurrentPeriodStart(new \DateTimeImmutable());
        }
        if (isset($stripeSubscription->current_period_end)) {
            $dbSubscription->setCurrentPeriodEnd(new \DateTimeImmutable('@' . $stripeSubscription->current_period_end));
        } else {
            $dbSubscription->setCurrentPeriodEnd(new \DateTimeImmutable('+1 month'));
        }

        $this->entityManager->persist($dbSubscription);
        $this->entityManager->flush();
    }
}
