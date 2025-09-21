<?php

namespace App\Tests\Controller;

use App\Entity\Task;
use App\Entity\Project;
use App\Entity\User;
use PHPUnit\Framework\TestCase;

class TaskControllerTest extends TestCase
{
    public function testTaskControllerExists(): void
    {
        $this->assertTrue(class_exists('App\Controller\TaskController'));
    }

    public function testTaskEntityExists(): void
    {
        $this->assertTrue(class_exists('App\Entity\Task'));
    }

    public function testTaskCreation(): void
    {
        $task = new Task();
        $task->setTitle('Test Task');
        $task->setDescription('Test description');
        
        $this->assertEquals('Test Task', $task->getTitle());
        $this->assertEquals('Test description', $task->getDescription());
    }

    public function testTaskStatus(): void
    {
        $task = new Task();
        $task->setStatus('in_progress');
        
        $this->assertEquals('in_progress', $task->getStatus());
    }

    public function testTaskPriority(): void
    {
        $task = new Task();
        $task->setPriority('high');
        
        $this->assertEquals('high', $task->getPriority());
    }

    public function testTaskProject(): void
    {
        $task = new Task();
        $project = new Project();
        $project->setName('Test Project');
        
        $task->setProject($project);
        
        $this->assertEquals($project, $task->getProject());
    }

    public function testTaskCreatedBy(): void
    {
        $task = new Task();
        $user = new User();
        $user->setEmail('test@example.com');
        
        $task->setCreatedBy($user);
        
        $this->assertEquals($user, $task->getCreatedBy());
    }

    public function testTaskAssignedTo(): void
    {
        $task = new Task();
        $user = new User();
        $user->setEmail('assignee@example.com');
        
        $task->setAssignedTo($user);
        
        $this->assertEquals($user, $task->getAssignedTo());
    }

    public function testTaskTimestamps(): void
    {
        $task = new Task();
        $now = new \DateTimeImmutable();
        
        $task->setCreatedAt($now);
        $task->setUpdatedAt($now);
        
        $this->assertEquals($now, $task->getCreatedAt());
        $this->assertEquals($now, $task->getUpdatedAt());
    }

    public function testTaskImages(): void
    {
        $task = new Task();
        $task->addImage('image1.jpg');
        $task->addImage('image2.jpg');
        
        $images = $task->getImages();
        $this->assertContains('image1.jpg', $images);
        $this->assertContains('image2.jpg', $images);
    }

    public function testTaskBasic(): void
    {
        $task = new Task();
        $task->setTitle('Test Task');
        $task->setDescription('Test description');
        
        $this->assertEquals('Test Task', $task->getTitle());
        $this->assertEquals('Test description', $task->getDescription());
    }

    public function testTaskId(): void
    {
        $task = new Task();
        $this->assertNull($task->getId());
    }
}
