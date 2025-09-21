<?php

namespace App\Tests\Entity;

use App\Entity\UserSkill;
use App\Entity\User;
use App\Entity\Skill;
use PHPUnit\Framework\TestCase;

class UserSkillTest extends TestCase
{
    private UserSkill $userSkill;

    protected function setUp(): void
    {
        $this->userSkill = new UserSkill();
    }

    public function testUserSkillCreation(): void
    {
        $this->assertInstanceOf(UserSkill::class, $this->userSkill);
        $this->assertNull($this->userSkill->getId());
    }

    public function testUser(): void
    {
        $user = $this->createMock(User::class);
        $this->userSkill->setUser($user);
        $this->assertEquals($user, $this->userSkill->getUser());
    }

    public function testSkill(): void
    {
        $skill = $this->createMock(Skill::class);
        $this->userSkill->setSkill($skill);
        $this->assertEquals($skill, $this->userSkill->getSkill());
    }

    public function testUserSkillBasic(): void
    {
        $user = $this->createMock(User::class);
        $skill = $this->createMock(Skill::class);
        
        $this->userSkill->setUser($user);
        $this->userSkill->setSkill($skill);
        
        $this->assertEquals($user, $this->userSkill->getUser());
        $this->assertEquals($skill, $this->userSkill->getSkill());
    }

    public function testUserSkillId(): void
    {
        $this->assertNull($this->userSkill->getId());
    }
}
