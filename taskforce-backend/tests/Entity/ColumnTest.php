<?php

namespace App\Tests\Entity;

use App\Entity\Column;
use App\Entity\Project;
use App\Entity\Task;
use PHPUnit\Framework\TestCase;

class ColumnTest extends TestCase
{
    public function testSettersAndGetters(): void
    {
        $column = new Column();
        $createdAt = new \DateTimeImmutable('2024-01-01 10:00:00');
        $updatedAt = new \DateTimeImmutable('2024-01-02 10:00:00');
        $project = new Project();

        $column->setName('Todo')
            ->setIdentifier('todo')
            ->setColor('#fff000')
            ->setDescription('Desc')
            ->setPosition(1)
            ->setIsActive(false)
            ->setCreatedAt($createdAt)
            ->setUpdatedAt($updatedAt)
            ->setProject($project);

        $this->assertSame('Todo', $column->getName());
        $this->assertSame('todo', $column->getIdentifier());
        $this->assertSame('#fff000', $column->getColor());
        $this->assertSame('Desc', $column->getDescription());
        $this->assertSame(1, $column->getPosition());
        $this->assertFalse($column->isActive());
        $this->assertSame($createdAt, $column->getCreatedAt());
        $this->assertSame($updatedAt, $column->getUpdatedAt());
        $this->assertSame($project, $column->getProject());
    }

    public function testTasksAddRemove(): void
    {
        $column = new Column();
        $task = new Task();

        $column->addTask($task);
        $this->assertTrue($column->getTasks()->contains($task));
        $this->assertSame($column, $task->getColumn());

        $column->removeTask($task);
        $this->assertFalse($column->getTasks()->contains($task));
        $this->assertNull($task->getColumn());
    }

    public function testLifecycleCallbacksSetDates(): void
    {
        $column = new Column();
        $column->setCreatedAtValue();

        $this->assertInstanceOf(\DateTimeImmutable::class, $column->getCreatedAt());
        $this->assertInstanceOf(\DateTimeImmutable::class, $column->getUpdatedAt());

        $column->setUpdatedAtValue();
        $this->assertInstanceOf(\DateTimeImmutable::class, $column->getUpdatedAt());
    }
}

