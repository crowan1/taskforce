<?php

namespace App\Tests\Entity;

use App\Entity\Subscription;
use App\Entity\User;
use PHPUnit\Framework\TestCase;

class SubscriptionTest extends TestCase
{
    private Subscription $subscription;

    protected function setUp(): void
    {
        $this->subscription = new Subscription();
    }

    public function testSubscriptionCreation(): void
    {
        $this->assertInstanceOf(Subscription::class, $this->subscription);
        $this->assertNull($this->subscription->getId());
    }

    public function testUser(): void
    {
        $user = $this->createMock(User::class);
        $this->subscription->setUser($user);
        $this->assertEquals($user, $this->subscription->getUser());
    }

    public function testPlan(): void
    {
        $this->subscription->setPlan('premium');
        $this->assertEquals('premium', $this->subscription->getPlan());
    }

    public function testStatus(): void
    {
        $this->subscription->setStatus('active');
        $this->assertEquals('active', $this->subscription->getStatus());
    }

    public function testSubscriptionBasic(): void
    {
        $user = $this->createMock(User::class);
        
        $this->subscription->setUser($user);
        $this->subscription->setPlan('premium');
        $this->subscription->setStatus('active');
        
        $this->assertEquals($user, $this->subscription->getUser());
        $this->assertEquals('premium', $this->subscription->getPlan());
        $this->assertEquals('active', $this->subscription->getStatus());
    }

    public function testSubscriptionId(): void
    {
        $this->assertNull($this->subscription->getId());
    }
}
