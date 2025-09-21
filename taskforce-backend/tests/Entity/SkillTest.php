<?php

namespace App\Tests\Entity;

use App\Entity\Skill;
use App\Entity\User;
use App\Entity\Task;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Validator\Validation;

class SkillTest extends TestCase
{
    private Skill $skill;
    private $validator;

    protected function setUp(): void
    {
        $this->skill = new Skill();
        $this->validator = Validation::createValidatorBuilder()
            ->enableAttributeMapping()
            ->getValidator();
    }

    public function testSkillCreation(): void
    {
        $this->assertInstanceOf(Skill::class, $this->skill);
        $this->assertNull($this->skill->getId());
        $this->assertTrue($this->skill->isActive());
    }

    public function testNameValidation(): void
    {
        $this->skill->setName('PHP');
        $this->assertEquals('PHP', $this->skill->getName());

        $this->skill->setName('');
        $violations = $this->validator->validate($this->skill);
        $this->assertGreaterThan(0, $violations->count());
    }

    public function testDescription(): void
    {
        $description = 'Programming language for web development';
        $this->skill->setDescription($description);
        $this->assertEquals($description, $this->skill->getDescription());

        $this->skill->setDescription(null);
        $this->assertNull($this->skill->getDescription());
    }

    public function testIsActive(): void
    {
        $this->skill->setIsActive(false);
        $this->assertFalse($this->skill->isActive());

        $this->skill->setIsActive(true);
        $this->assertTrue($this->skill->isActive());
    }

    public function testTimestamps(): void
    {
        $now = new \DateTimeImmutable();
        $this->skill->setCreatedAt($now);
        $this->skill->setUpdatedAt($now);
        
        $this->assertEquals($now, $this->skill->getCreatedAt());
        $this->assertEquals($now, $this->skill->getUpdatedAt());
    }

    public function testCreatedBy(): void
    {
        $user = $this->createMock(User::class);
        $this->skill->setCreatedBy($user);
        $this->assertEquals($user, $this->skill->getCreatedBy());
    }

    public function testTasks(): void
    {
        $task1 = $this->createMock(Task::class);
        $task2 = $this->createMock(Task::class);
        
        $this->skill->addTask($task1);
        $this->skill->addTask($task2);
        
        $this->assertTrue($this->skill->getTasks()->contains($task1));
        $this->assertTrue($this->skill->getTasks()->contains($task2));
        
        $this->skill->removeTask($task1);
        $this->assertFalse($this->skill->getTasks()->contains($task1));
        $this->assertTrue($this->skill->getTasks()->contains($task2));
    }

    public function testValidationConstraints(): void
    {
        $this->skill->setName('Valid Skill Name');
        $this->skill->setDescription('Valid description');
        $this->skill->setIsActive(true);
        
        $violations = $this->validator->validate($this->skill);
        $this->assertEquals(0, $violations->count());

        $invalidSkill = new Skill();
        $invalidSkill->setName(''); // Nom vide
        
        $violations = $this->validator->validate($invalidSkill);
        $this->assertGreaterThan(0, $violations->count());
    }
}
