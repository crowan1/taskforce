<?php

namespace App\Tests\Controller;

use App\Controller\ProjectController;
use App\Entity\Project;
use App\Entity\ProjectUser;
use App\Entity\Role;
use App\Entity\Skill;
use App\Entity\User;
use App\Entity\UserSkill;
use App\Repository\ProjectRepository;
use App\Repository\ProjectUserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class ProjectControllerTest extends TestCase
{
    public function testGetProjectsSuccess(): void
    {
        $user = $this->makeUser(1, 'owner@example.com');
        $project = $this->makeProject(10, $user);

        $projectUser = new ProjectUser();
        $projectUser->setProject($project)->setUser($user);
        $project->addProjectUser($projectUser);

        $projectRepository = $this->createMock(ProjectRepository::class);
        $projectRepository->method('findByUser')->with(1)->willReturn([$project]);

        $controller = $this->buildController($projectRepository, $this->createMock(ProjectUserRepository::class));
        $controller->setUser($user);

        $response = $controller->getProjects();
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
        $this->assertCount(1, $payload['projects']);
    }

    public function testGetProjectsUnauthorized(): void
    {
        $projectRepository = $this->createMock(ProjectRepository::class);
        $controller = $this->buildController($projectRepository, $this->createMock(ProjectUserRepository::class));
        $controller->setUser(null);

        $response = $controller->getProjects();
        $payload = json_decode($response->getContent(), true);

        $this->assertFalse($payload['success']);
    }

    public function testGetProjectsRepositoryError(): void
    {
        $user = $this->makeUser(1, 'owner@example.com');
        $projectRepository = $this->createMock(ProjectRepository::class);
        $projectRepository->method('findByUser')->willThrowException(new \RuntimeException('DB error'));

        $controller = $this->buildController($projectRepository, $this->createMock(ProjectUserRepository::class));
        $controller->setUser($user);

        $response = $controller->getProjects();
        $payload = json_decode($response->getContent(), true);

        $this->assertFalse($payload['success']);
    }

    public function testCreateProjectSuccess(): void
    {
        $user = $this->makeUser(1, 'owner@example.com');
        $role = new Role();
        $role->setIdentifier('responsable_projet')->setDisplayName('Responsable');

        $roleRepository = $this->createMock(EntityRepository::class);
        $roleRepository->method('findOneBy')->willReturn($role);

        $entityManager = $this->createEntityManager([
            Role::class => $roleRepository
        ]);

        $entityManager->method('persist')->willReturnCallback(function ($entity) {
            if (method_exists($entity, 'setCreatedAtValue')) {
                $entity->setCreatedAtValue();
            }
        });

        $projectRepository = $this->createMock(ProjectRepository::class);
        $projectRepository->method('countByUser')->willReturn(0);

        $controller = $this->buildController($projectRepository, $this->createMock(ProjectUserRepository::class), $entityManager);
        $controller->setUser($user);

        $request = new Request([], [], [], [], [], [], json_encode([
            'name' => 'New Project',
            'description' => 'Desc'
        ]));

        $response = $controller->createProject($request);
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
        $this->assertSame('New Project', $payload['project']['name']);
    }

    public function testCreateProjectLimitReached(): void
    {
        $user = $this->makeUser(1, 'owner@example.com');

        $projectRepository = $this->createMock(ProjectRepository::class);
        $projectRepository->method('countByUser')->willReturn(2);

        $controller = $this->buildController($projectRepository, $this->createMock(ProjectUserRepository::class));
        $controller->setUser($user);

        $request = new Request([], [], [], [], [], [], json_encode([
            'name' => 'New Project'
        ]));

        $response = $controller->createProject($request);
        $payload = json_decode($response->getContent(), true);

        $this->assertFalse($payload['success']);
    }

    public function testAddUserToProjectSuccess(): void
    {
        $currentUser = $this->makeUser(1, 'owner@example.com');
        $targetUser = $this->makeUser(2, 'member@example.com');
        $project = $this->makeProject(10, $currentUser);

        $responsableRole = new Role();
        $responsableRole->setIdentifier('responsable_projet')->setDisplayName('Responsable');
        $currentProjectUser = new ProjectUser();
        $currentProjectUser->setProject($project)->setUser($currentUser)->setRole($responsableRole);

        $projectRepository = $this->createMock(ProjectRepository::class);
        $projectRepository->method('find')->with(10)->willReturn($project);

        $projectUserRepository = $this->createMock(ProjectUserRepository::class);
        $projectUserRepository->method('findByUserAndProject')->willReturnCallback(
            fn($userId, $projectId) => $userId === 1 ? $currentProjectUser : null
        );

        $roleRepository = $this->createMock(EntityRepository::class);
        $roleRepository->method('findOneBy')->willReturn($responsableRole);

        $userRepository = $this->createMock(EntityRepository::class);
        $userRepository->method('findOneBy')->willReturn($targetUser);

        $entityManager = $this->createEntityManager([
            Role::class => $roleRepository,
            User::class => $userRepository
        ]);

        $controller = $this->buildController($projectRepository, $projectUserRepository, $entityManager);
        $controller->setUser($currentUser);

        $request = new Request([], [], [], [], [], [], json_encode([
            'email' => 'member@example.com',
            'role' => 'responsable_projet'
        ]));

        $response = $controller->addUserToProject(10, $request);
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
        $this->assertSame('member@example.com', $payload['user']['email']);
    }

    public function testAddUserToProjectProjectNotFound(): void
    {
        $currentUser = $this->makeUser(1, 'owner@example.com');

        $projectRepository = $this->createMock(ProjectRepository::class);
        $projectRepository->method('find')->with(10)->willReturn(null);

        $controller = $this->buildController($projectRepository, $this->createMock(ProjectUserRepository::class));
        $controller->setUser($currentUser);

        $request = new Request([], [], [], [], [], [], json_encode([
            'email' => 'member@example.com'
        ]));

        $response = $controller->addUserToProject(10, $request);
        $payload = json_decode($response->getContent(), true);

        $this->assertArrayHasKey('error', $payload);
    }

    public function testAddUserToProjectMissingEmail(): void
    {
        $currentUser = $this->makeUser(1, 'owner@example.com');
        $project = $this->makeProject(10, $currentUser);

        $responsableRole = new Role();
        $responsableRole->setIdentifier('responsable_projet')->setDisplayName('Responsable');
        $currentProjectUser = new ProjectUser();
        $currentProjectUser->setProject($project)->setUser($currentUser)->setRole($responsableRole);

        $projectRepository = $this->createMock(ProjectRepository::class);
        $projectRepository->method('find')->with(10)->willReturn($project);

        $projectUserRepository = $this->createMock(ProjectUserRepository::class);
        $projectUserRepository->method('findByUserAndProject')->willReturn($currentProjectUser);

        $controller = $this->buildController($projectRepository, $projectUserRepository);
        $controller->setUser($currentUser);

        $response = $controller->addUserToProject(10, new Request([], [], [], [], [], [], json_encode([])));
        $payload = json_decode($response->getContent(), true);

        $this->assertArrayHasKey('error', $payload);
    }

    public function testUpdateUserRoleSuccess(): void
    {
        $currentUser = $this->makeUser(1, 'owner@example.com');
        $project = $this->makeProject(10, $currentUser);

        $responsableRole = new Role();
        $responsableRole->setIdentifier('responsable_projet')->setDisplayName('Responsable');
        $currentProjectUser = new ProjectUser();
        $currentProjectUser->setProject($project)->setUser($currentUser)->setRole($responsableRole);

        $targetUser = $this->makeUser(2, 'member@example.com');
        $targetProjectUser = new ProjectUser();
        $targetProjectUser->setProject($project)->setUser($targetUser)->setRole($responsableRole);

        $projectRepository = $this->createMock(ProjectRepository::class);
        $projectRepository->method('find')->with(10)->willReturn($project);

        $projectUserRepository = $this->createMock(ProjectUserRepository::class);
        $projectUserRepository->method('findByUserAndProject')->willReturnCallback(
            fn($userId, $projectId) => $userId === 1 ? $currentProjectUser : $targetProjectUser
        );

        $roleRepository = $this->createMock(EntityRepository::class);
        $roleRepository->method('findOneBy')->willReturn($responsableRole);

        $entityManager = $this->createEntityManager([
            Role::class => $roleRepository
        ]);

        $controller = $this->buildController($projectRepository, $projectUserRepository, $entityManager);
        $controller->setUser($currentUser);

        $request = new Request([], [], [], [], [], [], json_encode([
            'userId' => 2,
            'role' => 'responsable_projet'
        ]));

        $response = $controller->updateUserRole(10, $request);
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
        $this->assertSame('member@example.com', $payload['user']['email']);
    }

    public function testUpdateUserRoleMissingData(): void
    {
        $currentUser = $this->makeUser(1, 'owner@example.com');
        $project = $this->makeProject(10, $currentUser);

        $responsableRole = new Role();
        $responsableRole->setIdentifier('responsable_projet')->setDisplayName('Responsable');
        $currentProjectUser = new ProjectUser();
        $currentProjectUser->setProject($project)->setUser($currentUser)->setRole($responsableRole);

        $projectRepository = $this->createMock(ProjectRepository::class);
        $projectRepository->method('find')->with(10)->willReturn($project);

        $projectUserRepository = $this->createMock(ProjectUserRepository::class);
        $projectUserRepository->method('findByUserAndProject')->willReturn($currentProjectUser);

        $controller = $this->buildController($projectRepository, $projectUserRepository);
        $controller->setUser($currentUser);

        $request = new Request([], [], [], [], [], [], json_encode([]));

        $response = $controller->updateUserRole(10, $request);
        $payload = json_decode($response->getContent(), true);

        $this->assertArrayHasKey('error', $payload);
    }

    public function testUpdateUserRoleInvalidRole(): void
    {
        $currentUser = $this->makeUser(1, 'owner@example.com');
        $project = $this->makeProject(10, $currentUser);

        $responsableRole = new Role();
        $responsableRole->setIdentifier('responsable_projet')->setDisplayName('Responsable');
        $currentProjectUser = new ProjectUser();
        $currentProjectUser->setProject($project)->setUser($currentUser)->setRole($responsableRole);

        $projectRepository = $this->createMock(ProjectRepository::class);
        $projectRepository->method('find')->with(10)->willReturn($project);

        $projectUserRepository = $this->createMock(ProjectUserRepository::class);
        $projectUserRepository->method('findByUserAndProject')->willReturn($currentProjectUser);

        $roleRepository = $this->createMock(EntityRepository::class);
        $roleRepository->method('findOneBy')->willReturn(null);

        $entityManager = $this->createEntityManager([
            Role::class => $roleRepository
        ]);

        $controller = $this->buildController($projectRepository, $projectUserRepository, $entityManager);
        $controller->setUser($currentUser);

        $request = new Request([], [], [], [], [], [], json_encode([
            'userId' => 2,
            'role' => 'unknown'
        ]));

        $response = $controller->updateUserRole(10, $request);
        $payload = json_decode($response->getContent(), true);

        $this->assertArrayHasKey('error', $payload);
    }

    public function testGetProjectUsersSuccess(): void
    {
        $currentUser = $this->makeUser(1, 'owner@example.com');
        $project = $this->makeProject(10, $currentUser);

        $role = new Role();
        $role->setIdentifier('collaborateur')->setDisplayName('Collaborateur');
        $projectUser = new ProjectUser();
        $projectUser->setProject($project)->setUser($currentUser)->setRole($role);

        $skill = new Skill();
        $skill->setName('PHP')->setDescription('Backend');
        $userSkill = new UserSkill();
        $userSkill->setUser($currentUser)->setSkill($skill);
        $currentUser->addUserSkill($userSkill);

        $projectRepository = $this->createMock(ProjectRepository::class);
        $projectRepository->method('find')->with(10)->willReturn($project);

        $projectUserRepository = $this->createMock(ProjectUserRepository::class);
        $projectUserRepository->method('findByUserAndProject')->willReturn($projectUser);
        $projectUserRepository->method('findByProject')->willReturn([$projectUser]);

        $controller = $this->buildController($projectRepository, $projectUserRepository);
        $controller->setUser($currentUser);

        $response = $controller->getProjectUsers(10);
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
        $this->assertCount(1, $payload['users']);
        $this->assertSame('PHP', $payload['users'][0]['skills'][0]['name']);
    }

    public function testRemoveUserFromProjectSuccess(): void
    {
        $currentUser = $this->makeUser(1, 'owner@example.com');
        $targetUser = $this->makeUser(2, 'member@example.com');
        $project = $this->makeProject(10, $currentUser);

        $responsableRole = new Role();
        $responsableRole->setIdentifier('responsable_projet')->setDisplayName('Responsable');
        $currentProjectUser = new ProjectUser();
        $currentProjectUser->setProject($project)->setUser($currentUser)->setRole($responsableRole);

        $targetProjectUser = new ProjectUser();
        $targetProjectUser->setProject($project)->setUser($targetUser)->setRole($responsableRole);

        $projectRepository = $this->createMock(ProjectRepository::class);
        $projectRepository->method('find')->with(10)->willReturn($project);

        $projectUserRepository = $this->createMock(ProjectUserRepository::class);
        $projectUserRepository->method('findByUserAndProject')->willReturnCallback(
            fn($userId, $projectId) => $userId === 1 ? $currentProjectUser : $targetProjectUser
        );
        $projectUserRepository->method('findResponsablesByProject')->willReturn([$currentProjectUser, $targetProjectUser]);

        $entityManager = $this->createMock(EntityManagerInterface::class);

        $controller = new ProjectControllerStub($entityManager, $projectRepository, $projectUserRepository);
        $controller->setUser($currentUser);

        $request = new Request([], [], [], [], [], [], json_encode([
            'userId' => 2
        ]));

        $response = $controller->removeUserFromProject(10, $request);
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
    }

    public function testDeleteProjectSuccess(): void
    {
        $currentUser = $this->makeUser(1, 'owner@example.com');
        $project = $this->makeProject(10, $currentUser);

        $projectRepository = $this->createMock(ProjectRepository::class);
        $projectRepository->method('find')->with(10)->willReturn($project);

        $alertRepository = $this->createMock(EntityRepository::class);
        $alertRepository->method('findBy')->willReturn([]);

        $entityManager = $this->createEntityManager([
            \App\Entity\AlertTask::class => $alertRepository
        ]);

        $controller = $this->buildController($projectRepository, $this->createMock(ProjectUserRepository::class), $entityManager);
        $controller->setUser($currentUser);

        $response = $controller->deleteProject(10);
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
    }

    public function testDeleteProjectNotFound(): void
    {
        $currentUser = $this->makeUser(1, 'owner@example.com');

        $projectRepository = $this->createMock(ProjectRepository::class);
        $projectRepository->method('find')->with(10)->willReturn(null);

        $controller = $this->buildController($projectRepository, $this->createMock(ProjectUserRepository::class));
        $controller->setUser($currentUser);

        $response = $controller->deleteProject(10);
        $payload = json_decode($response->getContent(), true);

        $this->assertArrayHasKey('error', $payload);
    }

    public function testDeleteProjectForbidden(): void
    {
        $currentUser = $this->makeUser(1, 'owner@example.com');
        $creator = $this->makeUser(2, 'creator@example.com');
        $project = $this->makeProject(10, $creator);

        $projectRepository = $this->createMock(ProjectRepository::class);
        $projectRepository->method('find')->with(10)->willReturn($project);

        $controller = $this->buildController($projectRepository, $this->createMock(ProjectUserRepository::class));
        $controller->setUser($currentUser);

        $response = $controller->deleteProject(10);
        $payload = json_decode($response->getContent(), true);

        $this->assertArrayHasKey('error', $payload);
    }

    private function buildController(
        ProjectRepository $projectRepository,
        ProjectUserRepository $projectUserRepository,
        ?EntityManagerInterface $entityManager = null
    ): ProjectControllerStub {
        $entityManager ??= $this->createMock(EntityManagerInterface::class);

        return new ProjectControllerStub($entityManager, $projectRepository, $projectUserRepository);
    }

    private function createEntityManager(array $repositories): EntityManagerInterface
    {
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->method('getRepository')->willReturnCallback(function ($class) use ($repositories) {
            return $repositories[$class] ?? $this->createMock(EntityRepository::class);
        });

        return $entityManager;
    }

    private function makeUser(int $id, string $email): User
    {
        $user = new User();
        $user->setEmail($email)->setFirstname('John')->setLastname('Doe');
        $this->setId($user, $id);
        $user->setCreatedAt(new \DateTimeImmutable('2024-01-01 10:00:00'));
        $user->setUpdatedAt(new \DateTimeImmutable('2024-01-02 10:00:00'));

        return $user;
    }

    private function makeProject(int $id, User $createdBy): Project
    {
        $project = new Project();
        $project->setName('Project');
        $project->setCreatedBy($createdBy);
        $project->setCreatedAt(new \DateTimeImmutable('2024-01-01 10:00:00'));
        $project->setUpdatedAt(new \DateTimeImmutable('2024-01-02 10:00:00'));
        $this->setId($project, $id);

        return $project;
    }

    private function setId(object $entity, int $id): void
    {
        $reflection = new \ReflectionClass($entity);
        $prop = $reflection->getProperty('id');
        $prop->setAccessible(true);
        $prop->setValue($entity, $id);
    }
}

class ProjectControllerStub extends ProjectController
{
    private ?User $user = null;

    public function setUser(?User $user): void
    {
        $this->user = $user;
    }

    protected function getUser(): ?User
    {
        return $this->user;
    }

    protected function json($data, int $status = 200, array $headers = [], array $context = []): JsonResponse
    {
        return new JsonResponse($data, $status, $headers);
    }
}

