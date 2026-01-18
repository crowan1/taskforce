<?php

namespace App\Tests\Entity;

use App\Entity\AlertTask;
use App\Entity\Project;
use App\Entity\User;
use PHPUnit\Framework\TestCase;

class AlertTaskTest extends TestCase
{
    public function testSettersAndGetters(): void
    {
        $alert = new AlertTask();
        $user = new User();
        $project = new Project();
        $dismissedAt = new \DateTimeImmutable('2024-01-01 10:00:00');

        $alert->setUser($user)
            ->setProject($project)
            ->setAlertType('overdue')
            ->setAlertEntityId(12)
            ->setDismissedAt($dismissedAt);

        $this->assertSame($user, $alert->getUser());
        $this->assertSame($project, $alert->getProject());
        $this->assertSame('overdue', $alert->getAlertType());
        $this->assertSame(12, $alert->getAlertEntityId());
        $this->assertSame($dismissedAt, $alert->getDismissedAt());
    }
}

