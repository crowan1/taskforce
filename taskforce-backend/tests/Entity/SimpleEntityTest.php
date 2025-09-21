<?php

namespace App\Tests\Entity;

use App\Entity\User;
use App\Entity\Project;
use App\Entity\Task;
use App\Entity\Skill;
use App\Entity\Column;
use PHPUnit\Framework\TestCase;

/**
 * Tests unitaires simples pour les entités sans dépendances Symfony
 */
class SimpleEntityTest extends TestCase
{
    public function testUserEntity(): void
    {
        $user = new User();
        
        $this->assertNull($user->getId());
        $this->assertEquals(['ROLE_USER'], $user->getRoles());
        $this->assertEquals(40.0, $user->getMaxWorkloadHours());
        
        $user->setEmail('test@example.com');
        $user->setFirstname('John');
        $user->setLastname('Doe');
        $user->setPassword('password123');
        $user->setMaxWorkloadHours(35.0);
        
        $this->assertEquals('test@example.com', $user->getEmail());
        $this->assertEquals('test@example.com', $user->getUserIdentifier());
        $this->assertEquals('John', $user->getFirstname());
        $this->assertEquals('Doe', $user->getLastname());
        $this->assertEquals('password123', $user->getPassword());
        $this->assertEquals(35.0, $user->getMaxWorkloadHours());
        
        $user->setRoles(['ROLE_ADMIN']);
        $roles = $user->getRoles();
        $this->assertContains('ROLE_USER', $roles);
        $this->assertContains('ROLE_ADMIN', $roles);
    }

    public function testProjectEntity(): void
    {
        $project = new Project();
        
        $this->assertNull($project->getId());
        $this->assertEquals('active', $project->getStatus());
        
        $project->setName('Test Project');
        $project->setDescription('Test description');
        $project->setStatus('completed');
        
        $this->assertEquals('Test Project', $project->getName());
        $this->assertEquals('Test description', $project->getDescription());
        $this->assertEquals('completed', $project->getStatus());
    }

    public function testTaskEntity(): void
    {
        $task = new Task();
        
        $this->assertNull($task->getId());
        $this->assertEquals('backlog', $task->getStatus());
        $this->assertEquals('medium', $task->getPriority());
        $this->assertEquals('intermediate', $task->getLevel());
        $this->assertEquals(1.0, $task->getEstimatedHours());
        $this->assertEquals([], $task->getImages());
        
        $task->setTitle('Test Task');
        $task->setDescription('Test task description');
        $task->setStatus('in_progress');
        $task->setPriority('high');
        $task->setLevel('expert');
        $task->setEstimatedHours(5.5);
        
        $this->assertEquals('Test Task', $task->getTitle());
        $this->assertEquals('Test task description', $task->getDescription());
        $this->assertEquals('in_progress', $task->getStatus());
        $this->assertEquals('high', $task->getPriority());
        $this->assertEquals('expert', $task->getLevel());
        $this->assertEquals(5.5, $task->getEstimatedHours());
        
        $images = ['image1.jpg', 'image2.png'];
        $task->setImages($images);
        $this->assertEquals($images, $task->getImages());
        
        $task->addImage('image3.jpg');
        $this->assertContains('image3.jpg', $task->getImages());
        
        $task->removeImage('image1.jpg');
        $this->assertNotContains('image1.jpg', $task->getImages());
    }

    public function testSkillEntity(): void
    {
        $skill = new Skill();
        
        $this->assertNull($skill->getId());
        $this->assertTrue($skill->isActive());
        
        $skill->setName('PHP');
        $skill->setDescription('PHP programming language');
        $skill->setIsActive(false);
        
        $this->assertEquals('PHP', $skill->getName());
        $this->assertEquals('PHP programming language', $skill->getDescription());
        $this->assertFalse($skill->isActive());
    }

    public function testColumnEntity(): void
    {
        $column = new Column();
        
        $this->assertNull($column->getId());
        $this->assertEquals('#6b7280', $column->getColor());
        $this->assertEquals(0, $column->getPosition());
        $this->assertTrue($column->isActive());
        
        $column->setName('To Do');
        $column->setIdentifier('todo');
        $column->setColor('#ff0000');
        $column->setDescription('Tasks to be done');
        $column->setPosition(1);
        $column->setIsActive(false);
        
        $this->assertEquals('To Do', $column->getName());
        $this->assertEquals('todo', $column->getIdentifier());
        $this->assertEquals('#ff0000', $column->getColor());
        $this->assertEquals('Tasks to be done', $column->getDescription());
        $this->assertEquals(1, $column->getPosition());
        $this->assertFalse($column->isActive());
    }

    public function testEntityRelationships(): void
    {
        $user = new User();
        $user->setEmail('user@example.com');
        $user->setFirstname('User');
        $user->setLastname('Test');
        
        $project = new Project();
        $project->setName('Test Project');
        $project->setCreatedBy($user);
        
        $task = new Task();
        $task->setTitle('Test Task');
        $task->setProject($project);
        $task->setCreatedBy($user);
        
        $this->assertEquals($user, $project->getCreatedBy());
        $this->assertEquals($project, $task->getProject());
        $this->assertEquals($user, $task->getCreatedBy());
    }

    public function testEntityTimestamps(): void
    {
        $now = new \DateTimeImmutable();
        
        $user = new User();
        $user->setCreatedAt($now);
        $user->setUpdatedAt($now);
        
        $this->assertEquals($now, $user->getCreatedAt());
        $this->assertEquals($now, $user->getUpdatedAt());
    }
}
