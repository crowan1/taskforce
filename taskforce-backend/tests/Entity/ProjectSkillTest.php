<?php

namespace App\Tests\Entity;

use App\Entity\Project;
use App\Entity\ProjectSkill;
use App\Entity\User;
use PHPUnit\Framework\TestCase;

class ProjectSkillTest extends TestCase
{
    public function testSettersAndGetters(): void
    {
        $projectSkill = new ProjectSkill();
        $project = new Project();
        $user = new User();
        $createdAt = new \DateTimeImmutable('2024-01-01 10:00:00');

        $projectSkill->setName('Design')
            ->setDescription('Desc')
            ->setProject($project)
            ->setCreatedBy($user)
            ->setCreatedAt($createdAt);

        $this->assertSame('Design', $projectSkill->getName());
        $this->assertSame('Desc', $projectSkill->getDescription());
        $this->assertSame($project, $projectSkill->getProject());
        $this->assertSame($user, $projectSkill->getCreatedBy());
        $this->assertSame($createdAt, $projectSkill->getCreatedAt());
    }

    public function testConstructorSetsCreatedAt(): void
    {
        $projectSkill = new ProjectSkill();
        $this->assertInstanceOf(\DateTimeImmutable::class, $projectSkill->getCreatedAt());
    }
}

