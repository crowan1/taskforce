<?php

namespace App\Tests\Entity;

use App\Entity\Project;
use App\Entity\ProjectUser;
use App\Entity\Role;
use App\Entity\User;
use PHPUnit\Framework\TestCase;

class ProjectUserTest extends TestCase
{
    public function testSettersAndGetters(): void
    {
        $projectUser = new ProjectUser();
        $project = new Project();
        $user = new User();
        $role = new Role();
        $role->setIdentifier('manager')->setDisplayName('Manager');
        $joinedAt = new \DateTimeImmutable('2024-01-01 10:00:00');

        $projectUser->setProject($project)
            ->setUser($user)
            ->setRole($role)
            ->setJoinedAt($joinedAt);

        $this->assertSame($project, $projectUser->getProject());
        $this->assertSame($user, $projectUser->getUser());
        $this->assertSame($role, $projectUser->getRole());
        $this->assertSame($joinedAt, $projectUser->getJoinedAt());
        $this->assertSame('manager', $projectUser->getRoleIdentifier());
        $this->assertSame('Manager', $projectUser->getRoleDisplayName());
        $this->assertNull($projectUser->getId());
    }

    public function testRoleChecks(): void
    {
        $projectUser = new ProjectUser();
        $role = new Role();
        $role->setIdentifier('responsable_projet')->setDisplayName('Responsable');

        $projectUser->setRole($role);

        $this->assertTrue($projectUser->isResponsableProjet());
        $this->assertFalse($projectUser->isManager());
        $this->assertFalse($projectUser->isCollaborateur());
        $this->assertTrue($projectUser->canManageProject());
        $this->assertTrue($projectUser->canAssignTasks());
        $this->assertTrue($projectUser->canViewReports());
    }

    public function testCollaborateurRolePermissions(): void
    {
        $projectUser = new ProjectUser();
        $role = new Role();
        $role->setIdentifier('collaborateur')->setDisplayName('Collaborateur');

        $projectUser->setRole($role);

        $this->assertTrue($projectUser->isCollaborateur());
        $this->assertFalse($projectUser->canManageProject());
        $this->assertFalse($projectUser->canAssignTasks());
        $this->assertFalse($projectUser->canViewReports());
    }

    public function testManagerRolePermissions(): void
    {
        $projectUser = new ProjectUser();
        $role = new Role();
        $role->setIdentifier('manager')->setDisplayName('Manager');

        $projectUser->setRole($role);

        $this->assertTrue($projectUser->isManager());
        $this->assertTrue($projectUser->canManageProject());
        $this->assertTrue($projectUser->canAssignTasks());
        $this->assertTrue($projectUser->canViewReports());
    }

    public function testRoleIdentifierNullWhenNoRole(): void
    {
        $projectUser = new ProjectUser();

        $this->assertNull($projectUser->getRoleIdentifier());
        $this->assertNull($projectUser->getRoleDisplayName());
    }
}

