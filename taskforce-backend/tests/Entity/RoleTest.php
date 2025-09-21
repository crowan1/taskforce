<?php

namespace App\Tests\Entity;

use App\Entity\Role;
use App\Entity\ProjectUser;
use PHPUnit\Framework\TestCase;

class RoleTest extends TestCase
{
    private Role $role;

    protected function setUp(): void
    {
        $this->role = new Role();
    }

    public function testRoleCreation(): void
    {
        $this->assertInstanceOf(Role::class, $this->role);
        $this->assertNull($this->role->getId());
    }

    public function testIdentifier(): void
    {
        $this->role->setIdentifier('admin');
        $this->assertEquals('admin', $this->role->getIdentifier());
    }

    public function testDisplayName(): void
    {
        $this->role->setDisplayName('Administrator');
        $this->assertEquals('Administrator', $this->role->getDisplayName());
    }

    public function testDescription(): void
    {
        $description = 'Administrator role with full access';
        $this->role->setDescription($description);
        $this->assertEquals($description, $this->role->getDescription());

        $this->role->setDescription(null);
        $this->assertNull($this->role->getDescription());
    }

    public function testProjectUsers(): void
    {
        $projectUser1 = $this->createMock(ProjectUser::class);
        $projectUser2 = $this->createMock(ProjectUser::class);
        
        $this->role->addProjectUser($projectUser1);
        $this->role->addProjectUser($projectUser2);
        
        $this->assertTrue($this->role->getProjectUsers()->contains($projectUser1));
        $this->assertTrue($this->role->getProjectUsers()->contains($projectUser2));
        
        $this->role->removeProjectUser($projectUser1);
        $this->assertFalse($this->role->getProjectUsers()->contains($projectUser1));
        $this->assertTrue($this->role->getProjectUsers()->contains($projectUser2));
    }

    public function testValidationConstraints(): void
    {
        $this->role->setIdentifier('valid-role');
        $this->role->setDisplayName('Valid Role Name');
        $this->role->setDescription('Valid description');
        
        $this->assertEquals('valid-role', $this->role->getIdentifier());
        $this->assertEquals('Valid Role Name', $this->role->getDisplayName());
        $this->assertEquals('Valid description', $this->role->getDescription());
    }

    public function testProjectUsersCollection(): void
    {
        $projectUsers = $this->role->getProjectUsers();
        
        $this->assertInstanceOf('Doctrine\Common\Collections\Collection', $projectUsers);
        $this->assertCount(0, $projectUsers);
    }

    public function testRoleToString(): void
    {
        $this->role->setDisplayName('Test Role');
        
        $this->assertEquals('Test Role', $this->role->getDisplayName());
    }
}
