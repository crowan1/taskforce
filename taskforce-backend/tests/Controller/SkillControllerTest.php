<?php

namespace App\Tests\Controller;

use App\Entity\Skill;
use App\Entity\User;
use PHPUnit\Framework\TestCase;

class SkillControllerTest extends TestCase
{
    public function testSkillControllerExists(): void
    {
        $this->assertTrue(class_exists('App\Controller\SkillController'));
    }

    public function testSkillEntityExists(): void
    {
        $this->assertTrue(class_exists('App\Entity\Skill'));
    }

    public function testSkillCreation(): void
    {
        $skill = new Skill();
        $skill->setName('PHP');
        $skill->setDescription('PHP programming skill');
        
        $this->assertEquals('PHP', $skill->getName());
        $this->assertEquals('PHP programming skill', $skill->getDescription());
    }

    public function testSkillIsActive(): void
    {
        $skill = new Skill();
        $skill->setIsActive(true);
        
        $this->assertTrue($skill->isActive());
        
        $skill->setIsActive(false);
        $this->assertFalse($skill->isActive());
    }

    public function testSkillCreatedBy(): void
    {
        $skill = new Skill();
        $user = new User();
        $user->setEmail('test@example.com');
        
        $skill->setCreatedBy($user);
        
        $this->assertEquals($user, $skill->getCreatedBy());
    }

    public function testSkillTimestamps(): void
    {
        $skill = new Skill();
        $now = new \DateTimeImmutable();
        
        $skill->setCreatedAt($now);
        $skill->setUpdatedAt($now);
        
        $this->assertEquals($now, $skill->getCreatedAt());
        $this->assertEquals($now, $skill->getUpdatedAt());
    }

    public function testSkillBasic(): void
    {
        $skill = new Skill();
        $skill->setName('PHP');
        $skill->setDescription('PHP programming');
        
        $this->assertEquals('PHP', $skill->getName());
        $this->assertEquals('PHP programming', $skill->getDescription());
    }

    public function testSkillId(): void
    {
        $skill = new Skill();
        $this->assertNull($skill->getId());
    }
}
