<?php

namespace App\Tests\Entity;

use App\Entity\Skill;
use App\Entity\Task;
use App\Entity\User;
use PHPUnit\Framework\TestCase;

class SkillTest extends TestCase
{
    public function testSettersAndGetters(): void
    {
        $skill = new Skill();
        $createdAt = new \DateTimeImmutable('2024-01-01 10:00:00');
        $updatedAt = new \DateTimeImmutable('2024-01-02 10:00:00');
        $user = new User();

        $skill->setName('PHP')
            ->setDescription('Desc')
            ->setIsActive(false)
            ->setCreatedAt($createdAt)
            ->setUpdatedAt($updatedAt)
            ->setCreatedBy($user);

        $this->assertSame('PHP', $skill->getName());
        $this->assertSame('Desc', $skill->getDescription());
        $this->assertFalse($skill->isActive());
        $this->assertSame($createdAt, $skill->getCreatedAt());
        $this->assertSame($updatedAt, $skill->getUpdatedAt());
        $this->assertSame($user, $skill->getCreatedBy());
    }

    public function testTasksAddRemove(): void
    {
        $skill = new Skill();
        $task = new Task();

        $skill->addTask($task);
        $this->assertTrue($skill->getTasks()->contains($task));

        $skill->removeTask($task);
        $this->assertFalse($skill->getTasks()->contains($task));
    }

    public function testLifecycleCallbacksSetDates(): void
    {
        $skill = new Skill();
        $skill->setCreatedAtValue();

        $this->assertInstanceOf(\DateTimeImmutable::class, $skill->getCreatedAt());
        $this->assertInstanceOf(\DateTimeImmutable::class, $skill->getUpdatedAt());

        $skill->setUpdatedAtValue();
        $this->assertInstanceOf(\DateTimeImmutable::class, $skill->getUpdatedAt());
    }
}

