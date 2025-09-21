<?php

namespace App\Tests\Entity;

use App\Entity\Column;
use App\Entity\Project;
use App\Entity\Task;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Validator\Validation;

class ColumnTest extends TestCase
{
    private Column $column;
    private $validator;

    protected function setUp(): void
    {
        $this->column = new Column();
        $this->validator = Validation::createValidatorBuilder()
            ->enableAttributeMapping()
            ->getValidator();
    }

    public function testColumnCreation(): void
    {
        $this->assertInstanceOf(Column::class, $this->column);
        $this->assertNull($this->column->getId());
        $this->assertEquals('#6b7280', $this->column->getColor());
        $this->assertEquals(0, $this->column->getPosition());
        $this->assertTrue($this->column->isActive());
    }

    public function testNameValidation(): void
    {
        $this->column->setName('To Do');
        $this->assertEquals('To Do', $this->column->getName());

        $this->column->setName('');
        $violations = $this->validator->validate($this->column);
        $this->assertGreaterThan(0, $violations->count());
    }

    public function testIdentifier(): void
    {
        $this->column->setIdentifier('todo');
        $this->assertEquals('todo', $this->column->getIdentifier());
    }

    public function testColor(): void
    {
        $this->column->setColor('#ff0000');
        $this->assertEquals('#ff0000', $this->column->getColor());
    }

    public function testDescription(): void
    {
        $description = 'Tasks that need to be done';
        $this->column->setDescription($description);
        $this->assertEquals($description, $this->column->getDescription());

        $this->column->setDescription(null);
        $this->assertNull($this->column->getDescription());
    }

    public function testPosition(): void
    {
        $this->column->setPosition(1);
        $this->assertEquals(1, $this->column->getPosition());

        $this->column->setPosition(5);
        $this->assertEquals(5, $this->column->getPosition());
    }

    public function testIsActive(): void
    {
        $this->column->setIsActive(false);
        $this->assertFalse($this->column->isActive());

        $this->column->setIsActive(true);
        $this->assertTrue($this->column->isActive());
    }

    public function testTimestamps(): void
    {
        $now = new \DateTimeImmutable();
        $this->column->setCreatedAt($now);
        $this->column->setUpdatedAt($now);
        
        $this->assertEquals($now, $this->column->getCreatedAt());
        $this->assertEquals($now, $this->column->getUpdatedAt());
    }

    public function testProject(): void
    {
        $project = $this->createMock(Project::class);
        $this->column->setProject($project);
        $this->assertEquals($project, $this->column->getProject());
    }

    public function testTasks(): void
    {
        $task1 = $this->createMock(Task::class);
        $task2 = $this->createMock(Task::class);
        
        $this->column->addTask($task1);
        $this->column->addTask($task2);
        
        $this->assertTrue($this->column->getTasks()->contains($task1));
        $this->assertTrue($this->column->getTasks()->contains($task2));
        
        $this->column->removeTask($task1);
        $this->assertFalse($this->column->getTasks()->contains($task1));
        $this->assertTrue($this->column->getTasks()->contains($task2));
    }

    public function testValidationConstraints(): void
    {
        $this->column->setName('Valid Column Name');
        $this->column->setIdentifier('valid-identifier');
        $this->column->setColor('#000000');
        $this->column->setDescription('Valid description');
        $this->column->setPosition(1);
        $this->column->setIsActive(true);
        
        $violations = $this->validator->validate($this->column);
        $this->assertEquals(0, $violations->count());

        $invalidColumn = new Column();
        $invalidColumn->setName(''); // Nom vide
        
        $violations = $this->validator->validate($invalidColumn);
        $this->assertGreaterThan(0, $violations->count());
    }
}
