<?php

namespace App\Tests\Entity;

use App\Entity\Task;
use App\Entity\User;
use App\Entity\Project;
use App\Entity\Column;
use App\Entity\Skill;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Validator\Validation;

class TaskTest extends TestCase
{
    private Task $task;
    private $validator;

    protected function setUp(): void
    {
        $this->task = new Task();
        $this->validator = Validation::createValidatorBuilder()
            ->enableAttributeMapping()
            ->getValidator();
    }

    public function testTaskCreation(): void
    {
        $this->assertInstanceOf(Task::class, $this->task);
        $this->assertNull($this->task->getId());
        $this->assertEquals('backlog', $this->task->getStatus());
        $this->assertEquals('medium', $this->task->getPriority());
        $this->assertEquals('intermediate', $this->task->getLevel());
        $this->assertEquals(1.0, $this->task->getEstimatedHours());
        $this->assertEquals([], $this->task->getImages());
    }

    public function testTitleValidation(): void
    {
        $this->task->setTitle('Test Task');
        $this->assertEquals('Test Task', $this->task->getTitle());

        $this->task->setTitle('');
        $violations = $this->validator->validate($this->task);
        $this->assertGreaterThan(0, $violations->count());
    }

    public function testDescription(): void
    {
        $description = 'This is a test task description';
        $this->task->setDescription($description);
        $this->assertEquals($description, $this->task->getDescription());

        $this->task->setDescription(null);
        $this->assertNull($this->task->getDescription());
    }

    public function testStatus(): void
    {
        $this->task->setStatus('in_progress');
        $this->assertEquals('in_progress', $this->task->getStatus());

        $this->task->setStatus('completed');
        $this->assertEquals('completed', $this->task->getStatus());
    }

    public function testPriority(): void
    {
        $this->task->setPriority('high');
        $this->assertEquals('high', $this->task->getPriority());

        $this->task->setPriority('low');
        $this->assertEquals('low', $this->task->getPriority());
    }

    public function testLevel(): void
    {
        $this->task->setLevel('beginner');
        $this->assertEquals('beginner', $this->task->getLevel());

        $this->task->setLevel('expert');
        $this->assertEquals('expert', $this->task->getLevel());
    }

    public function testEstimatedHours(): void
    {
        $this->task->setEstimatedHours(5.5);
        $this->assertEquals(5.5, $this->task->getEstimatedHours());

        $this->task->setEstimatedHours(-2);
        $violations = $this->validator->validate($this->task);
        $this->assertGreaterThan(0, $violations->count());
    }

    public function testTimestamps(): void
    {
        $now = new \DateTimeImmutable();
        $this->task->setCreatedAt($now);
        $this->task->setUpdatedAt($now);
        
        $this->assertEquals($now, $this->task->getCreatedAt());
        $this->assertEquals($now, $this->task->getUpdatedAt());
    }

    public function testAssignedTo(): void
    {
        $user = $this->createMock(User::class);
        $this->task->setAssignedTo($user);
        
        $this->assertEquals($user, $this->task->getAssignedTo());
        $this->assertInstanceOf(\DateTimeImmutable::class, $this->task->getAssignedAt());
    }

    public function testAssignmentScore(): void
    {
        $this->task->setAssignmentScore(85.5);
        $this->assertEquals(85.5, $this->task->getAssignmentScore());

        $this->task->setAssignmentScore(null);
        $this->assertNull($this->task->getAssignmentScore());
    }

    public function testCreatedBy(): void
    {
        $user = $this->createMock(User::class);
        $this->task->setCreatedBy($user);
        $this->assertEquals($user, $this->task->getCreatedBy());
    }

    public function testProject(): void
    {
        $project = $this->createMock(Project::class);
        $this->task->setProject($project);
        $this->assertEquals($project, $this->task->getProject());
    }

    public function testColumn(): void
    {
        $column = $this->createMock(Column::class);
        $this->task->setColumn($column);
        $this->assertEquals($column, $this->task->getColumn());
    }

    public function testRequiredSkills(): void
    {
        $skill1 = $this->createMock(Skill::class);
        $skill2 = $this->createMock(Skill::class);
        
        $this->task->addRequiredSkill($skill1);
        $this->task->addRequiredSkill($skill2);
        
        $this->assertTrue($this->task->getRequiredSkills()->contains($skill1));
        $this->assertTrue($this->task->getRequiredSkills()->contains($skill2));
        
        $this->task->removeRequiredSkill($skill1);
        $this->assertFalse($this->task->getRequiredSkills()->contains($skill1));
        $this->assertTrue($this->task->getRequiredSkills()->contains($skill2));
    }

    public function testImages(): void
    {
        $images = ['image1.jpg', 'image2.png'];
        $this->task->setImages($images);
        $this->assertEquals($images, $this->task->getImages());

        $this->task->addImage('image3.jpg');
        $this->assertContains('image3.jpg', $this->task->getImages());

        $this->task->removeImage('image1.jpg');
        $this->assertNotContains('image1.jpg', $this->task->getImages());
    }

    public function testValidationConstraints(): void
    {
        $this->task->setTitle('Valid Task Title');
        $this->task->setDescription('Valid description');
        $this->task->setEstimatedHours(2.5);
        
        $violations = $this->validator->validate($this->task);
        $this->assertEquals(0, $violations->count());

        $invalidTask = new Task();
        $invalidTask->setTitle(''); // Titre vide
        $invalidTask->setEstimatedHours(-1); // Heures négatives
        
        $violations = $this->validator->validate($invalidTask);
        $this->assertGreaterThan(0, $violations->count());
    }
}
