<?php

namespace App\Tests\Entity;

use App\Entity\ProjectSkill;
use App\Entity\Project;
use App\Entity\Skill;
use PHPUnit\Framework\TestCase;

class ProjectSkillTest extends TestCase
{
    private ProjectSkill $projectSkill;

    protected function setUp(): void
    {
        $this->projectSkill = new ProjectSkill();
    }

    public function testProjectSkillCreation(): void
    {
        $this->assertInstanceOf(ProjectSkill::class, $this->projectSkill);
        $this->assertNull($this->projectSkill->getId());
    }

    public function testProject(): void
    {
        $project = $this->createMock(Project::class);
        $this->projectSkill->setProject($project);
        $this->assertEquals($project, $this->projectSkill->getProject());
    }

    public function testProjectSkillBasic(): void
    {
        $project = $this->createMock(Project::class);
        $this->projectSkill->setProject($project);
        $this->assertEquals($project, $this->projectSkill->getProject());
    }

    public function testProjectSkillId(): void
    {
        $this->assertNull($this->projectSkill->getId());
    }
}
