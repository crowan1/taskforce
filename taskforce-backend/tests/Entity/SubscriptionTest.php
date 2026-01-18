<?php

namespace App\Tests\Entity;

use App\Entity\Subscription;
use App\Entity\User;
use PHPUnit\Framework\TestCase;

class SubscriptionTest extends TestCase
{
    public function testSettersAndGetters(): void
    {
        $subscription = new Subscription();
        $user = new User();
        $createdAt = new \DateTimeImmutable('2024-01-01 10:00:00');
        $updatedAt = new \DateTimeImmutable('2024-01-02 10:00:00');
        $periodStart = new \DateTimeImmutable('2024-01-03 10:00:00');
        $periodEnd = new \DateTimeImmutable('2024-02-03 10:00:00');

        $subscription->setUser($user)
            ->setStripeSubscriptionId('sub_123')
            ->setStatus('active')
            ->setPlan('premium')
            ->setAmount('9.99')
            ->setCurrency('eur')
            ->setCreatedAt($createdAt)
            ->setUpdatedAt($updatedAt)
            ->setCurrentPeriodStart($periodStart)
            ->setCurrentPeriodEnd($periodEnd);

        $this->assertSame($user, $subscription->getUser());
        $this->assertSame('sub_123', $subscription->getStripeSubscriptionId());
        $this->assertSame('active', $subscription->getStatus());
        $this->assertSame('premium', $subscription->getPlan());
        $this->assertSame('9.99', $subscription->getAmount());
        $this->assertSame('eur', $subscription->getCurrency());
        $this->assertSame($createdAt, $subscription->getCreatedAt());
        $this->assertSame($updatedAt, $subscription->getUpdatedAt());
        $this->assertSame($periodStart, $subscription->getCurrentPeriodStart());
        $this->assertSame($periodEnd, $subscription->getCurrentPeriodEnd());
        $this->assertNull($subscription->getId());
    }

    public function testStatusHelpers(): void
    {
        $subscription = new Subscription();
        $subscription->setStatus('active')->setPlan('premium');

        $this->assertTrue($subscription->isActive());
        $this->assertTrue($subscription->isPremium());

        $subscription->setStatus('canceled');
        $this->assertFalse($subscription->isActive());
        $this->assertFalse($subscription->isPremium());
    }

    public function testUpdateTimestampOnUpdate(): void
    {
        $subscription = new Subscription();
        $subscription->setUpdatedAtValue();

        $this->assertInstanceOf(\DateTimeImmutable::class, $subscription->getUpdatedAt());
    }

    public function testConstructorSetsTimestamps(): void
    {
        $subscription = new Subscription();

        $this->assertInstanceOf(\DateTimeImmutable::class, $subscription->getCreatedAt());
        $this->assertInstanceOf(\DateTimeImmutable::class, $subscription->getUpdatedAt());
    }
}

