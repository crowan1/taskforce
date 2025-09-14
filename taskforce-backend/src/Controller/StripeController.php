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
        Stripe::setApiKey($_ENV['STRIPE_SECRET_KEY']);
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
            $amount = $data['amount'] ?? 200; //2€

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
                'publishable_key' => $_ENV['STRIPE_PUBLISHABLE_KEY']
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
                    'price' => 'price_1S6BN0JUQKk2FvCnHOsbdaAz',
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
            $dbSubscription->setAmount('2.00');
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

            $subscription = $this->entityManager->getRepository(Subscription::class)->findByUser($user);
            
            if (!$subscription) {
                return new JsonResponse(['error' => 'Aucun abonnement trouvé'], 404);
            }

            if ($subscription->getStripeSubscriptionId()) {
                try {
                    $stripeSubscription = \Stripe\Subscription::retrieve($subscription->getStripeSubscriptionId());
                    $stripeSubscription->cancel();
                } catch (ApiErrorException $e) {
                }
            }

            $subscription->setStatus('cancelled');
            $this->entityManager->persist($subscription);
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

    #[Route('/webhook', name: 'webhook', methods: ['POST'])]
    public function webhook(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sigHeader = $request->headers->get('stripe-signature');
        $endpointSecret = $_ENV['STRIPE_WEBHOOK_SECRET'] ?? '';

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
}
