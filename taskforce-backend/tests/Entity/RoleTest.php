<?php

namespace App\Tests\Entity;

use App\Entity\Role;
use PHPUnit\Framework\TestCase;

class RoleTest extends TestCase
{
    public function testSettersAndGetters(): void
    {
        $role = new Role();
        $role->setIdentifier('manager')
            ->setDisplayName('Manager')
            ->setDescription('Role description');

        $this->assertSame('manager', $role->getIdentifier());
        $this->assertSame('Manager', $role->getDisplayName());
        $this->assertSame('Role description', $role->getDescription());
        $this->assertCount(0, $role->getProjectUsers());
        $this->assertNull($role->getId());
    }

    public function testAddAndRemoveProjectUser(): void
    {
        $role = new Role();
        $projectUser = $this->createMock(\App\Entity\ProjectUser::class);
        $projectUser->method('getRole')->willReturn(null);
        $projectUser->expects($this->exactly(2))->method('setRole');

        $role->addProjectUser($projectUser);
        $this->assertTrue($role->getProjectUsers()->contains($projectUser));

        $role->removeProjectUser($projectUser);
        $this->assertFalse($role->getProjectUsers()->contains($projectUser));
    }
}

