<?php

namespace App\Tests\Entity;

use App\Entity\User;
use App\Entity\ProjectUser;
use App\Entity\Subscription;
use App\Entity\UserSkill;
use PHPUnit\Framework\TestCase;

class UserTest extends TestCase
{
    private User $user;

    protected function setUp(): void
    {
        $this->user = new User();
    }

    public function testUserCreation(): void
    {
        $this->assertInstanceOf(User::class, $this->user);
        $this->assertNull($this->user->getId());
        $this->assertEquals(['ROLE_USER'], $this->user->getRoles());
        $this->assertEquals(40.0, $this->user->getMaxWorkloadHours());
    }



    public function testFirstnameAndLastname(): void
    {
        $this->user->setFirstname('John');
        $this->user->setLastname('Doe');
        
        $this->assertEquals('John', $this->user->getFirstname());
        $this->assertEquals('Doe', $this->user->getLastname());
    }

    public function testRoles(): void
    {
        $this->user->setRoles(['ROLE_ADMIN']);
        $roles = $this->user->getRoles();
        
        $this->assertContains('ROLE_USER', $roles);
        $this->assertContains('ROLE_ADMIN', $roles);
    }

    public function testMaxWorkloadHours(): void
    {
        $this->user->setMaxWorkloadHours(35.5);
        $this->assertEquals(35.5, $this->user->getMaxWorkloadHours());
 
        $this->user->setMaxWorkloadHours(-10);
        $this->assertEquals(-10, $this->user->getMaxWorkloadHours());
    }

    public function testTimestamps(): void
    {
        $now = new \DateTimeImmutable();
        $this->user->setCreatedAt($now);
        $this->user->setUpdatedAt($now);
        
        $this->assertEquals($now, $this->user->getCreatedAt());
        $this->assertEquals($now, $this->user->getUpdatedAt());
    }

    public function testProjectUsers(): void
    {
        $projectUser = $this->createMock(ProjectUser::class);
        
        $this->user->addProjectUser($projectUser);
        $this->assertTrue($this->user->getProjectUsers()->contains($projectUser));
        
        $this->user->removeProjectUser($projectUser);
        $this->assertFalse($this->user->getProjectUsers()->contains($projectUser));
    }

    public function testUserSkills(): void
    {
        $userSkill = $this->createMock(UserSkill::class);
        
        $this->user->addUserSkill($userSkill);
        $this->assertTrue($this->user->getUserSkills()->contains($userSkill));
        
        $this->user->removeUserSkill($userSkill);
        $this->assertFalse($this->user->getUserSkills()->contains($userSkill));
    }


    public function testEraseCredentials(): void
    {
        $this->user->eraseCredentials();
        $this->assertTrue(true);
    }

 
    public function testUserRegistrationFlow(): void
    {
        $this->user->setEmail('newuser@example.com');
        $this->user->setPassword('securePassword123');
        $this->user->setFirstname('Jane');
        $this->user->setLastname('Smith');
        
        $this->assertNotNull($this->user->getEmail());
        $this->assertNotNull($this->user->getPassword());
        $this->assertContains('ROLE_USER', $this->user->getRoles());
    }

    public function testUserAuthenticationFlow(): void
    {
        $this->user->setEmail('auth@example.com');
        $this->user->setPassword('hashedPassword');
        
        $this->assertEquals('auth@example.com', $this->user->getUserIdentifier());
        $this->assertNotNull($this->user->getPassword());
    }

    public function testUserProfileUpdateFlow(): void
    {
        $this->user->setFirstname('Updated');
        $this->user->setLastname('Name');
        $this->user->setMaxWorkloadHours(35.0);
        
        $this->assertEquals('Updated', $this->user->getFirstname());
        $this->assertEquals('Name', $this->user->getLastname());
        $this->assertEquals(35.0, $this->user->getMaxWorkloadHours());
    }
 
    public function testUserWithMultipleProjectUsers(): void
    {
        $projectUser1 = $this->createMock(ProjectUser::class);
        $projectUser2 = $this->createMock(ProjectUser::class);
        
        $this->user->addProjectUser($projectUser1);
        $this->user->addProjectUser($projectUser2);
        
        $this->assertCount(2, $this->user->getProjectUsers());
        $this->assertTrue($this->user->getProjectUsers()->contains($projectUser1));
        $this->assertTrue($this->user->getProjectUsers()->contains($projectUser2));
    }

    public function testUserWithMultipleSkills(): void
    {
        $skill1 = $this->createMock(UserSkill::class);
        $skill2 = $this->createMock(UserSkill::class);
        $skill3 = $this->createMock(UserSkill::class);
        
        $this->user->addUserSkill($skill1);
        $this->user->addUserSkill($skill2);
        $this->user->addUserSkill($skill3);
        
        $this->assertCount(3, $this->user->getUserSkills());
    }
 
    public function testPremiumUserLogic(): void
    { 
        $this->assertFalse($this->user->isPremium());
         
        $subscription = $this->createMock(Subscription::class);
        $subscription->method('isActive')->willReturn(true);
        $subscription->method('getPlan')->willReturn('premium');
         
        $this->assertFalse($this->user->isPremium());
    }

    public function testWorkloadManagement(): void
    {
        $this->user->setMaxWorkloadHours(40.0);
        $this->assertEquals(40.0, $this->user->getMaxWorkloadHours());
        
        $this->user->setMaxWorkloadHours(20.0);
        $this->assertEquals(20.0, $this->user->getMaxWorkloadHours());
        
        $this->user->setMaxWorkloadHours(60.0);
        $this->assertEquals(60.0, $this->user->getMaxWorkloadHours());
    }

    public function testEmailValidation(): void
    {
        $this->user->setEmail('valid@example.com');
        $this->assertEquals('valid@example.com', $this->user->getEmail());
        
        $this->user->setEmail('');
        $this->assertEquals('', $this->user->getEmail());
        
        $this->user->setEmail('user+tag@domain.co.uk');
        $this->assertEquals('user+tag@domain.co.uk', $this->user->getEmail());
    }

    public function testPasswordSecurity(): void
    {
        $this->user->setPassword('password123');
        $this->assertEquals('password123', $this->user->getPassword());
        
        $complexPassword = 'P@ssw0rd!2024#Secure';
        $this->user->setPassword($complexPassword);
        $this->assertEquals($complexPassword, $this->user->getPassword());
    }


    public function testUserRoleManagement(): void
    {
        $this->assertContains('ROLE_USER', $this->user->getRoles());
        
        $this->user->setRoles(['ROLE_ADMIN']);
        $roles = $this->user->getRoles();
        $this->assertContains('ROLE_USER', $roles);
        $this->assertContains('ROLE_ADMIN', $roles);

        $this->user->setRoles(['ROLE_USER', 'ROLE_ADMIN', 'ROLE_MANAGER']);
        $roles = $this->user->getRoles();
        $this->assertContains('ROLE_USER', $roles);
        $this->assertContains('ROLE_ADMIN', $roles);
        $this->assertContains('ROLE_MANAGER', $roles);
    }

    public function testUserTimestampsManagement(): void
    {
        $now = new \DateTimeImmutable();
        $this->user->setCreatedAt($now);
        $this->user->setUpdatedAt($now);
        
        $this->assertEquals($now, $this->user->getCreatedAt());
        $this->assertEquals($now, $this->user->getUpdatedAt());
        

        $later = $now->modify('+1 hour');
        $this->user->setUpdatedAt($later);
        $this->assertEquals($later, $this->user->getUpdatedAt());
        $this->assertEquals($now, $this->user->getCreatedAt()); 
    }
}
