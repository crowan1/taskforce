<?php

namespace App\Tests\Entity;

use App\Entity\ProjectUser;
use App\Entity\Project;
use App\Entity\User;
use App\Entity\Role;
use PHPUnit\Framework\TestCase;

class ProjectUserTest extends TestCase
{
    private ProjectUser $projectUser;

    protected function setUp(): void
    {
        $this->projectUser = new ProjectUser();
    }

    public function testProjectUserCreation(): void
    {
        $this->assertInstanceOf(ProjectUser::class, $this->projectUser);
        $this->assertNull($this->projectUser->getId());
    }

    public function testProject(): void
    {
        $project = $this->createMock(Project::class);
        $this->projectUser->setProject($project);
        $this->assertEquals($project, $this->projectUser->getProject());
    }

    public function testUser(): void
    {
        $user = $this->createMock(User::class);
        $this->projectUser->setUser($user);
        $this->assertEquals($user, $this->projectUser->getUser());
    }

    public function testRole(): void
    {
        $role = $this->createMock(Role::class);
        $this->projectUser->setRole($role);
        $this->assertEquals($role, $this->projectUser->getRole());
    }

    public function testProjectUserBasic(): void
    {
        $project = $this->createMock(Project::class);
        $user = $this->createMock(User::class);
        $role = $this->createMock(Role::class);
        
        $this->projectUser->setProject($project);
        $this->projectUser->setUser($user);
        $this->projectUser->setRole($role);
        
        $this->assertEquals($project, $this->projectUser->getProject());
        $this->assertEquals($user, $this->projectUser->getUser());
        $this->assertEquals($role, $this->projectUser->getRole());
    }

    public function testProjectUserId(): void
    {
        $this->assertNull($this->projectUser->getId());
    }
}
