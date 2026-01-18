<?php

namespace App\Tests\Entity;

use App\Entity\Project;
use App\Entity\ProjectUser;
use App\Entity\Skill;
use App\Entity\Subscription;
use App\Entity\User;
use App\Entity\UserSkill;
use Doctrine\Common\Collections\ArrayCollection;
use PHPUnit\Framework\TestCase;

class UserTest extends TestCase
{
    public function testDefaultRoleIsUser(): void
    {
        $user = new User();

        $this->assertContains('ROLE_USER', $user->getRoles());
    }

    public function testSettersAndGetters(): void
    {
        $user = new User();
        $createdAt = new \DateTimeImmutable('2024-01-01 10:00:00');
        $updatedAt = new \DateTimeImmutable('2024-01-02 10:00:00');

        $user->setEmail('test@example.com')
            ->setPassword('secret')
            ->setFirstname('John')
            ->setLastname('Doe')
            ->setCreatedAt($createdAt)
            ->setUpdatedAt($updatedAt)
            ->setMaxWorkloadHours(35.5)
            ->setRoles(['ROLE_ADMIN']);

        $this->assertSame('test@example.com', $user->getEmail());
        $this->assertSame('secret', $user->getPassword());
        $this->assertSame('John', $user->getFirstname());
        $this->assertSame('Doe', $user->getLastname());
        $this->assertSame($createdAt, $user->getCreatedAt());
        $this->assertSame($updatedAt, $user->getUpdatedAt());
        $this->assertSame(35.5, $user->getMaxWorkloadHours());
        $this->assertContains('ROLE_ADMIN', $user->getRoles());
        $this->assertSame('test@example.com', $user->getUserIdentifier());
        $this->assertNull($user->getId());
    }

    public function testProjectUsersAddRemoveAndGetProjects(): void
    {
        $user = new User();
        $project = new Project();
        $project->setName('Project A');

        $projectUser = new ProjectUser();
        $projectUser->setProject($project);

        $user->addProjectUser($projectUser);

        $this->assertTrue($user->getProjectUsers()->contains($projectUser));
        $this->assertSame($user, $projectUser->getUser());
        $this->assertCount(1, $user->getProjects());

        $user->removeProjectUser($projectUser);

        $this->assertFalse($user->getProjectUsers()->contains($projectUser));
        $this->assertNull($projectUser->getUser());
    }

    public function testUserSkillsAddRemoveAndGetSkills(): void
    {
        $user = new User();
        $skill = new Skill();
        $skill->setName('PHP');

        $userSkill = new UserSkill();
        $userSkill->setSkill($skill);

        $user->addUserSkill($userSkill);

        $this->assertTrue($user->getUserSkills()->contains($userSkill));
        $this->assertSame($user, $userSkill->getUser());
        $this->assertSame('PHP', $user->getSkills()[0]['name']);

        $user->removeUserSkill($userSkill);

        $this->assertFalse($user->getUserSkills()->contains($userSkill));
        $this->assertNull($userSkill->getUser());
    }

    public function testIsPremiumChecksActiveSubscription(): void
    {
        $user = new User();
        $subscription = new Subscription();
        $subscription->setStatus('active')->setPlan('premium');

        $this->setPrivateProperty($user, 'subscriptions', new ArrayCollection([$subscription]));

        $this->assertTrue($user->isPremium());
    }

    public function testIsPremiumFalseWhenNoSubscriptions(): void
    {
        $user = new User();

        $this->assertFalse($user->isPremium());
    }

    public function testEraseCredentialsDoesNotThrow(): void
    {
        $user = new User();
        $user->eraseCredentials();

        $this->assertTrue(true);
    }

    public function testGetUserSkillsCollection(): void
    {
        $user = new User();

        $this->assertInstanceOf('Doctrine\Common\Collections\Collection', $user->getUserSkills());
    }

    public function testLifecycleCallbacksSetDates(): void
    {
        $user = new User();
        $user->setCreatedAtValue();

        $this->assertInstanceOf(\DateTimeImmutable::class, $user->getCreatedAt());
        $this->assertInstanceOf(\DateTimeImmutable::class, $user->getUpdatedAt());

        $user->setUpdatedAtValue();

        $this->assertInstanceOf(\DateTimeImmutable::class, $user->getUpdatedAt());
    }

    private function setPrivateProperty(object $object, string $property, mixed $value): void
    {
        $reflection = new \ReflectionClass($object);
        $prop = $reflection->getProperty($property);
        $prop->setAccessible(true);
        $prop->setValue($object, $value);
    }
}

