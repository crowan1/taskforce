<?php

namespace App\Tests\Entity;

use App\Entity\Column;
use App\Entity\Project;
use App\Entity\ProjectUser;
use App\Entity\Task;
use App\Entity\User;
use PHPUnit\Framework\TestCase;

class ProjectTest extends TestCase
{
    public function testSettersAndGetters(): void
    {
        $project = new Project();
        $createdAt = new \DateTimeImmutable('2024-01-01 10:00:00');
        $updatedAt = new \DateTimeImmutable('2024-01-02 10:00:00');
        $user = new User();

        $project->setName('Project A')
            ->setDescription('Desc')
            ->setStatus('active')
            ->setCreatedAt($createdAt)
            ->setUpdatedAt($updatedAt)
            ->setCreatedBy($user);

        $this->assertSame('Project A', $project->getName());
        $this->assertSame('Desc', $project->getDescription());
        $this->assertSame('active', $project->getStatus());
        $this->assertSame($createdAt, $project->getCreatedAt());
        $this->assertSame($updatedAt, $project->getUpdatedAt());
        $this->assertSame($user, $project->getCreatedBy());
    }

    public function testTasksAndColumns(): void
    {
        $project = new Project();
        $task = new Task();
        $column = new Column();

        $project->addTask($task);
        $project->addColumn($column);

        $this->assertTrue($project->getTasks()->contains($task));
        $this->assertTrue($project->getColumns()->contains($column));
        $this->assertSame($project, $task->getProject());
        $this->assertSame($project, $column->getProject());

        $project->removeTask($task);
        $project->removeColumn($column);

        $this->assertFalse($project->getTasks()->contains($task));
        $this->assertFalse($project->getColumns()->contains($column));
        $this->assertNull($task->getProject());
        $this->assertNull($column->getProject());
    }

    public function testProjectUsersAndGetUsers(): void
    {
        $project = new Project();
        $user = new User();
        $projectUser = new ProjectUser();
        $projectUser->setUser($user);

        $project->addProjectUser($projectUser);

        $this->assertTrue($project->getProjectUsers()->contains($projectUser));
        $this->assertSame($project, $projectUser->getProject());
        $this->assertCount(1, $project->getUsers());

        $project->removeProjectUser($projectUser);

        $this->assertFalse($project->getProjectUsers()->contains($projectUser));
        $this->assertNull($projectUser->getProject());
    }

    public function testLifecycleCallbacksSetDates(): void
    {
        $project = new Project();
        $project->setCreatedAtValue();

        $this->assertInstanceOf(\DateTimeImmutable::class, $project->getCreatedAt());
        $this->assertInstanceOf(\DateTimeImmutable::class, $project->getUpdatedAt());

        $project->setUpdatedAtValue();
        $this->assertInstanceOf(\DateTimeImmutable::class, $project->getUpdatedAt());
    }
}

