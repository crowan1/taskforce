<?php

namespace App\Tests\Controller;

use App\Entity\User;
use App\Entity\Project;
use App\Entity\Role;
use PHPUnit\Framework\TestCase;

class ProjectControllerTest extends TestCase
{
    public function testProjectControllerExists(): void
    {
        $this->assertTrue(class_exists('App\Controller\ProjectController'));
    }

    public function testProjectEntityExists(): void
    {
        $this->assertTrue(class_exists('App\Entity\Project'));
    }

    public function testProjectCreation(): void
    {
        $project = new Project();
        $project->setName('Test Project');
        $project->setDescription('Test description');
        
        $this->assertEquals('Test Project', $project->getName());
        $this->assertEquals('Test description', $project->getDescription());
    }

    public function testProjectStatus(): void
    {
        $project = new Project();
        $project->setStatus('active');
        
        $this->assertEquals('active', $project->getStatus());
    }

    public function testProjectCreatedBy(): void
    {
        $project = new Project();
        $user = new User();
        $user->setEmail('test@example.com');
        
        $project->setCreatedBy($user);
        
        $this->assertEquals($user, $project->getCreatedBy());
    }

    public function testProjectTimestamps(): void
    {
        $project = new Project();
        $now = new \DateTimeImmutable();
        
        $project->setCreatedAt($now);
        $project->setUpdatedAt($now);
        
        $this->assertEquals($now, $project->getCreatedAt());
        $this->assertEquals($now, $project->getUpdatedAt());
    }

    public function testProjectTasks(): void
    {
        $project = new Project();
        $tasks = $project->getTasks();
        
        $this->assertInstanceOf('Doctrine\Common\Collections\Collection', $tasks);
        $this->assertCount(0, $tasks);
    }

    public function testProjectColumns(): void
    {
        $project = new Project();
        $columns = $project->getColumns();
        
        $this->assertInstanceOf('Doctrine\Common\Collections\Collection', $columns);
        $this->assertCount(0, $columns);
    }

    public function testProjectProjectUsers(): void
    {
        $project = new Project();
        $projectUsers = $project->getProjectUsers();
        
        $this->assertInstanceOf('Doctrine\Common\Collections\Collection', $projectUsers);
        $this->assertCount(0, $projectUsers);
    }

    public function testProjectId(): void
    {
        $project = new Project();
        
        $this->assertNull($project->getId());
    }

    public function testRoleEntityExists(): void
    {
        $this->assertTrue(class_exists('App\Entity\Role'));
    }

    public function testRoleCreation(): void
    {
        $role = new Role();
        $role->setIdentifier('responsable_projet');
        $role->setDisplayName('Responsable de projet');
        
        $this->assertEquals('responsable_projet', $role->getIdentifier());
        $this->assertEquals('Responsable de projet', $role->getDisplayName());
    }

    public function testRoleId(): void
    {
        $role = new Role();
        
        $this->assertNull($role->getId());
    }

    public function testRoleProjectUsers(): void
    {
        $role = new Role();
        $projectUsers = $role->getProjectUsers();
        
        $this->assertInstanceOf('Doctrine\Common\Collections\Collection', $projectUsers);
        $this->assertCount(0, $projectUsers);
    }

    public function testRoleDescription(): void
    {
        $role = new Role();
        $role->setDescription('Description du rôle');
        
        $this->assertEquals('Description du rôle', $role->getDescription());
    }

    public function testRoleAddProjectUser(): void
    {
        $role = new Role();
        $projectUser = $this->createMock('App\Entity\ProjectUser');
        
        $role->addProjectUser($projectUser);
        
        $this->assertTrue($role->getProjectUsers()->contains($projectUser));
    }

    public function testRoleRemoveProjectUser(): void
    {
        $role = new Role();
        $projectUser = $this->createMock('App\Entity\ProjectUser');
        
        $role->addProjectUser($projectUser);
        $role->removeProjectUser($projectUser);
        
        $this->assertFalse($role->getProjectUsers()->contains($projectUser));
    }

    public function testRoleDisplayName(): void
    {
        $role = new Role();
        $role->setDisplayName('Test Role');
        
        $this->assertEquals('Test Role', $role->getDisplayName());
    }

    public function testRoleProjectUsersCount(): void
    {
        $role = new Role();
        
        $this->assertCount(0, $role->getProjectUsers());
    }
}
