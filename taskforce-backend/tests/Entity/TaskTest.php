<?php

namespace App\Tests\Entity;

use App\Entity\Column;
use App\Entity\Project;
use App\Entity\Skill;
use App\Entity\Task;
use App\Entity\User;
use PHPUnit\Framework\TestCase;

class TaskTest extends TestCase
{
    public function testDefaults(): void
    {
        $task = new Task();

        $this->assertSame('backlog', $task->getStatus());
        $this->assertSame('medium', $task->getPriority());
        $this->assertSame('intermediate', $task->getLevel());
        $this->assertSame(1.0, $task->getEstimatedHours());
        $this->assertSame([], $task->getImages());
        $this->assertFalse($task->isFinished());
    }

    public function testSettersAndGetters(): void
    {
        $task = new Task();
        $createdAt = new \DateTimeImmutable('2024-01-01 10:00:00');
        $updatedAt = new \DateTimeImmutable('2024-01-02 10:00:00');
        $dueDate = new \DateTimeImmutable('2024-02-01 10:00:00');

        $task->setTitle('Test')
            ->setDescription('Desc')
            ->setStatus('todo')
            ->setPriority('high')
            ->setLevel('senior')
            ->setEstimatedHours(5.5)
            ->setCreatedAt($createdAt)
            ->setUpdatedAt($updatedAt)
            ->setDueDate($dueDate)
            ->setIsFinished(true);

        $this->assertSame('Test', $task->getTitle());
        $this->assertSame('Desc', $task->getDescription());
        $this->assertSame('todo', $task->getStatus());
        $this->assertSame('high', $task->getPriority());
        $this->assertSame('senior', $task->getLevel());
        $this->assertSame(5.5, $task->getEstimatedHours());
        $this->assertSame($createdAt, $task->getCreatedAt());
        $this->assertSame($updatedAt, $task->getUpdatedAt());
        $this->assertSame($dueDate, $task->getDueDate());
        $this->assertTrue($task->isFinished());
    }

    public function testRelationsAndAssignment(): void
    {
        $task = new Task();
        $project = new Project();
        $user = new User();
        $column = new Column();

        $task->setProject($project)->setCreatedBy($user)->setColumn($column);
        $task->setAssignmentScore(0.75);

        $this->assertSame($project, $task->getProject());
        $this->assertSame($user, $task->getCreatedBy());
        $this->assertSame($column, $task->getColumn());
        $this->assertSame(0.75, $task->getAssignmentScore());

        $task->setAssignedTo($user);
        $this->assertSame($user, $task->getAssignedTo());
        $this->assertInstanceOf(\DateTimeImmutable::class, $task->getAssignedAt());
        $task->setAssignedAt(null);
        $this->assertNull($task->getAssignedAt());
    }

    public function testRequiredSkillsAndImages(): void
    {
        $task = new Task();
        $skill = new Skill();
        $skill->setName('PHP');

        $task->addRequiredSkill($skill);
        $this->assertTrue($task->getRequiredSkills()->contains($skill));
        $task->addRequiredSkill($skill);
        $this->assertCount(1, $task->getRequiredSkills());

        $task->removeRequiredSkill($skill);
        $this->assertFalse($task->getRequiredSkills()->contains($skill));

        $task->addImage('a.png')->addImage('b.png');
        $this->assertSame(['a.png', 'b.png'], $task->getImages());

        $task->removeImage('a.png');
        $this->assertSame(['b.png'], $task->getImages());

        $task->removeImage('missing.png');
        $this->assertSame(['b.png'], $task->getImages());
    }

    public function testLifecycleCallbacksSetDates(): void
    {
        $task = new Task();
        $task->setCreatedAtValue();

        $this->assertInstanceOf(\DateTimeImmutable::class, $task->getCreatedAt());
        $this->assertInstanceOf(\DateTimeImmutable::class, $task->getUpdatedAt());

        $task->setUpdatedAtValue();
        $this->assertInstanceOf(\DateTimeImmutable::class, $task->getUpdatedAt());
    }

    public function testAssignedToCanBeCleared(): void
    {
        $task = new Task();
        $user = new User();

        $task->setAssignedTo($user);
        $task->setAssignedTo(null);

        $this->assertNull($task->getAssignedTo());
    }

    public function testSetImages(): void
    {
        $task = new Task();
        $task->setImages(['x.png']);

        $this->assertSame(['x.png'], $task->getImages());
    }
}

