<?php

namespace App\Tests\Controller;

use App\Entity\Column;
use App\Entity\Project;
use App\Entity\Task;
use PHPUnit\Framework\TestCase;

class ColumnControllerTest extends TestCase
{
    public function testColumnControllerExists(): void
    {
        $this->assertTrue(class_exists('App\Controller\ColumnController'));
    }

    public function testColumnEntityExists(): void
    {
        $this->assertTrue(class_exists('App\Entity\Column'));
    }

    public function testColumnCreation(): void
    {
        $column = new Column();
        $column->setName('To Do');
        $column->setIdentifier('todo');
        
        $this->assertEquals('To Do', $column->getName());
        $this->assertEquals('todo', $column->getIdentifier());
    }

    public function testColumnColor(): void
    {
        $column = new Column();
        $column->setColor('#FF0000');
        
        $this->assertEquals('#FF0000', $column->getColor());
    }

    public function testColumnDescription(): void
    {
        $description = 'Tasks that need to be done';
        $column = new Column();
        $column->setDescription($description);
        
        $this->assertEquals($description, $column->getDescription());
    }

    public function testColumnPosition(): void
    {
        $column = new Column();
        $column->setPosition(1);
        
        $this->assertEquals(1, $column->getPosition());
    }

    public function testColumnIsActive(): void
    {
        $column = new Column();
        $column->setIsActive(true);
        
        $this->assertTrue($column->isActive());
        
        $column->setIsActive(false);
        $this->assertFalse($column->isActive());
    }

    public function testColumnProject(): void
    {
        $column = new Column();
        $project = new Project();
        $project->setName('Test Project');
        
        $column->setProject($project);
        
        $this->assertEquals($project, $column->getProject());
    }

    public function testColumnTasks(): void
    {
        $column = new Column();
        $task1 = $this->createMock(Task::class);
        $task2 = $this->createMock(Task::class);
        
        $column->addTask($task1);
        $column->addTask($task2);
        
        $this->assertTrue($column->getTasks()->contains($task1));
        $this->assertTrue($column->getTasks()->contains($task2));
        
        $column->removeTask($task1);
        $this->assertFalse($column->getTasks()->contains($task1));
        $this->assertTrue($column->getTasks()->contains($task2));
    }

    public function testColumnTimestamps(): void
    {
        $column = new Column();
        $now = new \DateTimeImmutable();
        
        $column->setCreatedAt($now);
        $column->setUpdatedAt($now);
        
        $this->assertEquals($now, $column->getCreatedAt());
        $this->assertEquals($now, $column->getUpdatedAt());
    }

    public function testColumnValidationConstraints(): void
    {
        $column = new Column();
        $column->setName('Valid Column Name');
        $column->setIdentifier('valid-identifier');
        $column->setColor('#000000');
        $column->setDescription('Valid description');
        $column->setPosition(1);
        $column->setIsActive(true);
        
        $this->assertEquals('Valid Column Name', $column->getName());
        $this->assertEquals('valid-identifier', $column->getIdentifier());
        $this->assertEquals('#000000', $column->getColor());
        $this->assertEquals('Valid description', $column->getDescription());
        $this->assertEquals(1, $column->getPosition());
        $this->assertTrue($column->isActive());
    }
}
