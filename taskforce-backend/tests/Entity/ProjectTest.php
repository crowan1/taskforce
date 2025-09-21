<?php

namespace App\Tests\Entity;

use App\Entity\Project;
use App\Entity\User;
use App\Entity\Task;
use App\Entity\Column;
use App\Entity\ProjectUser;
use PHPUnit\Framework\TestCase;

class ProjectTest extends TestCase
{
    private Project $project;
    protected function setUp(): void
    {
        $this->project = new Project();
    }

    public function testProjectCreation(): void
    {
        $this->assertInstanceOf(Project::class, $this->project);
        $this->assertNull($this->project->getId());
        $this->assertEquals('active', $this->project->getStatus());
    }

    public function testNameValidation(): void
    {
        $this->project->setName('Test Project');
        $this->assertEquals('Test Project', $this->project->getName());

        // Test nom vide
        $this->project->setName('');
        $this->assertEquals('', $this->project->getName());
    }

    public function testDescription(): void
    {
        $description = 'This is a test project description';
        $this->project->setDescription($description);
        $this->assertEquals($description, $this->project->getDescription());

        // Test avec description null
        $this->project->setDescription(null);
        $this->assertNull($this->project->getDescription());
    }

    public function testStatus(): void
    {
        $this->project->setStatus('completed');
        $this->assertEquals('completed', $this->project->getStatus());

        $this->project->setStatus('archived');
        $this->assertEquals('archived', $this->project->getStatus());
    }

    public function testTimestamps(): void
    {
        $now = new \DateTimeImmutable();
        $this->project->setCreatedAt($now);
        $this->project->setUpdatedAt($now);
        
        $this->assertEquals($now, $this->project->getCreatedAt());
        $this->assertEquals($now, $this->project->getUpdatedAt());
    }

    public function testCreatedBy(): void
    {
        $user = $this->createMock(User::class);
        $this->project->setCreatedBy($user);
        $this->assertEquals($user, $this->project->getCreatedBy());
    }

    public function testTasks(): void
    {
        $task = $this->createMock(Task::class);
        
        $this->project->addTask($task);
        $this->assertTrue($this->project->getTasks()->contains($task));
        
        $this->project->removeTask($task);
        $this->assertFalse($this->project->getTasks()->contains($task));
    }

    public function testColumns(): void
    {
        $column = $this->createMock(Column::class);
        
        $this->project->addColumn($column);
        $this->assertTrue($this->project->getColumns()->contains($column));
        
        $this->project->removeColumn($column);
        $this->assertFalse($this->project->getColumns()->contains($column));
    }

    public function testProjectUsers(): void
    {
        $projectUser = $this->createMock(ProjectUser::class);
        
        $this->project->addProjectUser($projectUser);
        $this->assertTrue($this->project->getProjectUsers()->contains($projectUser));
        
        $this->project->removeProjectUser($projectUser);
        $this->assertFalse($this->project->getProjectUsers()->contains($projectUser));
    }

    public function testGetUsers(): void
    {
        $user1 = $this->createMock(User::class);
        $user2 = $this->createMock(User::class);
        
        $projectUser1 = $this->createMock(ProjectUser::class);
        $projectUser1->method('getUser')->willReturn($user1);
        
        $projectUser2 = $this->createMock(ProjectUser::class);
        $projectUser2->method('getUser')->willReturn($user2);
        
        $this->project->addProjectUser($projectUser1);
        $this->project->addProjectUser($projectUser2);
        
        $users = $this->project->getUsers();
        $this->assertCount(2, $users);
        $this->assertContains($user1, $users);
        $this->assertContains($user2, $users);
    }

    public function testValidationConstraints(): void
    { 
        $this->project->setName('Valid Project Name');
        $this->project->setDescription('Valid description');
        $this->project->setStatus('active');
        
        $this->assertEquals('Valid Project Name', $this->project->getName());
        $this->assertEquals('Valid description', $this->project->getDescription());
        $this->assertEquals('active', $this->project->getStatus());
    }
}
