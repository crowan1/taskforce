<?php

namespace App\Tests\Entity;

use App\Entity\Skill;
use App\Entity\User;
use App\Entity\UserSkill;
use PHPUnit\Framework\TestCase;

class UserSkillTest extends TestCase
{
    public function testSettersAndGetters(): void
    {
        $userSkill = new UserSkill();
        $user = new User();
        $skill = new Skill();
        $skill->setName('PHP');
        $createdAt = new \DateTimeImmutable('2024-01-01 10:00:00');
        $updatedAt = new \DateTimeImmutable('2024-01-02 10:00:00');

        $userSkill->setUser($user)
            ->setSkill($skill)
            ->setCreatedAt($createdAt)
            ->setUpdatedAt($updatedAt);

        $this->assertSame($user, $userSkill->getUser());
        $this->assertSame($skill, $userSkill->getSkill());
        $this->assertSame($createdAt, $userSkill->getCreatedAt());
        $this->assertSame($updatedAt, $userSkill->getUpdatedAt());
        $this->assertNull($userSkill->getId());
    }
}

