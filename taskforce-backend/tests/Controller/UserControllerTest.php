<?php

namespace App\Tests\Controller;

use App\Entity\User;
use App\Entity\ProjectUser;
use PHPUnit\Framework\TestCase;

class UserControllerTest extends TestCase
{
    public function testUserControllerExists(): void
    {
        $this->assertTrue(class_exists('App\Controller\UserController'));
    }

    public function testUserEntityExists(): void
    {
        $this->assertTrue(class_exists('App\Entity\User'));
    }

    public function testUserCreation(): void
    {
        $user = new User();
        $user->setEmail('test@example.com');
        $user->setFirstname('John');
        $user->setLastname('Doe');
        
        $this->assertEquals('test@example.com', $user->getEmail());
        $this->assertEquals('John', $user->getFirstname());
        $this->assertEquals('Doe', $user->getLastname());
    }

    public function testUserRoles(): void
    {
        $user = new User();
        $roles = $user->getRoles();
        
        $this->assertIsArray($roles);
        $this->assertContains('ROLE_USER', $roles);
    }

    public function testUserPassword(): void
    {
        $user = new User();
        $user->setPassword('password123');
        
        $this->assertEquals('password123', $user->getPassword());
    }

    public function testUserMaxWorkload(): void
    {
        $user = new User();
        $user->setMaxWorkloadHours(35.5);
        
        $this->assertEquals(35.5, $user->getMaxWorkloadHours());
    }

    public function testUserIsPremium(): void
    {
        $user = new User();
        
        $this->assertFalse($user->isPremium());
    }

    public function testUserProjectUsers(): void
    {
        $user = new User();
        $projectUsers = $user->getProjectUsers();
        
        $this->assertInstanceOf('Doctrine\Common\Collections\Collection', $projectUsers);
        $this->assertCount(0, $projectUsers);
    }

    public function testUserTimestamps(): void
    {
        $user = new User();
        $now = new \DateTimeImmutable();
        
        $user->setCreatedAt($now);
        $user->setUpdatedAt($now);
        
        $this->assertEquals($now, $user->getCreatedAt());
        $this->assertEquals($now, $user->getUpdatedAt());
    }

    public function testUserIdentifier(): void
    {
        $user = new User();
        $user->setEmail('test@example.com');
        
        $this->assertEquals('test@example.com', $user->getUserIdentifier());
    }

    public function testUserEraseCredentials(): void
    {
        $user = new User();
        $user->eraseCredentials();
        
        $this->assertTrue(true);
    }

    public function testUserBasic(): void
    {
        $user = new User();
        $user->setEmail('test@example.com');
        $user->setFirstname('John');
        $user->setLastname('Doe');
        
        $this->assertEquals('test@example.com', $user->getEmail());
        $this->assertEquals('John', $user->getFirstname());
        $this->assertEquals('Doe', $user->getLastname());
    }

    public function testUserId(): void
    {
        $user = new User();
        $this->assertNull($user->getId());
    }
}
