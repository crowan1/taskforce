<?php

namespace App\Tests\Controller;

use App\Controller\StripeController;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;

class StripeControllerTest extends TestCase
{
    protected function setUp(): void
    {
        $_ENV['STRIPE_SECRET_KEY'] = 'test';
        $_ENV['STRIPE_PUBLISHABLE_KEY'] = 'test';
    }

    public function testCreatePaymentIntentUnauthorized(): void
    {
        $controller = $this->buildController();
        $response = $controller->createPaymentIntent(new Request([], [], [], [], [], [], json_encode(['amount' => 1000])));

        $this->assertSame(401, $response->getStatusCode());
    }

    public function testCreateCheckoutSessionUnauthorized(): void
    {
        $controller = $this->buildController();
        $response = $controller->createCheckoutSession(new Request());

        $this->assertSame(401, $response->getStatusCode());
    }

    public function testGetSubscriptionStatusUnauthorized(): void
    {
        $controller = $this->buildController();
        $response = $controller->getSubscriptionStatus();

        $this->assertSame(401, $response->getStatusCode());
    }

    public function testCancelSubscriptionUnauthorized(): void
    {
        $controller = $this->buildController();
        $response = $controller->cancelSubscription();

        $this->assertSame(401, $response->getStatusCode());
    }

    public function testSyncSubscriptionUnauthorized(): void
    {
        $controller = $this->buildController();
        $response = $controller->syncSubscription();

        $this->assertSame(401, $response->getStatusCode());
    }

    private function buildController(): StripeControllerStub
    {
        return new StripeControllerStub($this->createMock(EntityManagerInterface::class));
    }
}

class StripeControllerStub extends StripeController
{
    protected function getUser(): ?\Symfony\Component\Security\Core\User\UserInterface
    {
        return null;
    }
}

