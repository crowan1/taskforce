<?php

namespace App\Tests\Controller;

use App\Controller\ProjectSkillController;
use App\Entity\Project;
use App\Entity\ProjectSkill;
use App\Entity\User;
use App\Repository\ProjectRepository;
use App\Service\ProjectSkillService;
use App\Repository\ProjectSkillRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class ProjectSkillControllerTest extends TestCase
{
    public function testGetProjectUserSkillsProjectNotFound(): void
    {
        $controller = $this->buildController();
        $response = $controller->getProjectUserSkills(10);
        $payload = json_decode($response->getContent(), true);

        $this->assertFalse($payload['success']);
    }

    public function testGetProjectUserSkillsSuccess(): void
    {
        $project = new Project();
        $this->setId($project, 10);

        $projectRepository = $this->createMock(ProjectRepository::class);
        $projectRepository->method('find')->with(10)->willReturn($project);

        $projectUserRepository = $this->createMock(EntityRepository::class);
        $projectUserRepository->method('findOneBy')->willReturn(new \stdClass());

        $service = $this->createMock(ProjectSkillService::class);
        $service->method('getProjectUserSkills')->willReturn([['id' => 1]]);

        $entityManager = $this->createEntityManager([
            'App\Entity\ProjectUser' => $projectUserRepository
        ]);

        $controller = $this->buildController($entityManager, $projectRepository, $service);
        $controller->setUser($this->makeUser(1));

        $response = $controller->getProjectUserSkills(10);
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
        $this->assertCount(1, $payload['skills']);
    }

    public function testGetAllAvailableProjectSkillsSuccess(): void
    {
        $project = new Project();
        $this->setId($project, 10);

        $projectRepository = $this->createMock(ProjectRepository::class);
        $projectRepository->method('find')->with(10)->willReturn($project);

        $projectUserRepository = $this->createMock(EntityRepository::class);
        $projectUserRepository->method('findOneBy')->willReturn(new \stdClass());

        $service = $this->createMock(ProjectSkillService::class);
        $service->method('getAllAvailableProjectSkills')->willReturn([['id' => 1]]);
        $service->method('hasProjectUsers')->willReturn(true);

        $entityManager = $this->createEntityManager([
            'App\Entity\ProjectUser' => $projectUserRepository
        ]);

        $controller = $this->buildController($entityManager, $projectRepository, $service);
        $controller->setUser($this->makeUser(1));

        $response = $controller->getAllAvailableProjectSkills(10);
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
        $this->assertTrue($payload['hasUsers']);
    }

    public function testCreateProjectSkillUnauthorized(): void
    {
        $project = new Project();
        $this->setId($project, 10);

        $projectRepository = $this->createMock(ProjectRepository::class);
        $projectRepository->method('find')->with(10)->willReturn($project);

        $projectUserRepository = $this->createMock(EntityRepository::class);
        $projectUserRepository->method('findOneBy')->willReturn(null);

        $entityManager = $this->createEntityManager([
            'App\Entity\ProjectUser' => $projectUserRepository
        ]);

        $controller = $this->buildController($entityManager, $projectRepository, $this->createMock(ProjectSkillService::class));
        $controller->setUser($this->makeUser(1));

        $request = new Request([], [], [], [], [], [], json_encode(['name' => 'Skill']));
        $response = $controller->createProjectSkill(10, $request);
        $payload = json_decode($response->getContent(), true);

        $this->assertFalse($payload['success']);
    }

    public function testCreateProjectSkillExistingSkillReturnsError(): void
    {
        $project = new Project();
        $this->setId($project, 10);

        $projectRepository = $this->createMock(ProjectRepository::class);
        $projectRepository->method('find')->with(10)->willReturn($project);

        $projectUser = $this->createMock(\App\Entity\ProjectUser::class);
        $projectUserRepository = $this->createMock(EntityRepository::class);
        $projectUserRepository->method('findOneBy')->willReturn($projectUser);

        $projectSkillRepository = $this->createMock(ProjectSkillRepository::class);
        $projectSkillRepository->method('existsForProject')->willReturn(true);

        $createdBy = $this->makeUser(1);
        $service = $this->createMock(ProjectSkillService::class);

        $entityManager = $this->createEntityManager([
            'App\Entity\ProjectUser' => $projectUserRepository,
            'App\Entity\ProjectSkill' => $projectSkillRepository
        ]);

        $controller = $this->buildController($entityManager, $projectRepository, $service);
        $controller->setUser($createdBy);

        $request = new Request([], [], [], [], [], [], json_encode(['name' => 'Skill']));
        $response = $controller->createProjectSkill(10, $request);
        $payload = json_decode($response->getContent(), true);

        $this->assertFalse($payload['success']);
    }

    public function testDeleteProjectSkillSuccess(): void
    {
        $createdBy = $this->makeUser(1);
        $projectSkill = new ProjectSkill();
        $projectSkill->setCreatedBy($createdBy)->setName('Skill');
        $this->setId($projectSkill, 12);

        $projectSkillRepository = $this->createMock(EntityRepository::class);
        $projectSkillRepository->method('find')->with(12)->willReturn($projectSkill);

        $entityManager = $this->createEntityManager([
            'App\Entity\ProjectSkill' => $projectSkillRepository
        ]);

        $service = $this->createMock(ProjectSkillService::class);

        $controller = $this->buildController($entityManager, $this->createMock(ProjectRepository::class), $service);
        $controller->setUser($createdBy);

        $response = $controller->deleteProjectSkill(12);
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
    }

    private function buildController(
        ?EntityManagerInterface $entityManager = null,
        ?ProjectRepository $projectRepository = null,
        ?ProjectSkillService $projectSkillService = null
    ): ProjectSkillControllerStub {
        $entityManager ??= $this->createMock(EntityManagerInterface::class);
        $projectRepository ??= $this->createMock(ProjectRepository::class);
        $projectSkillService ??= $this->createMock(ProjectSkillService::class);

        return new ProjectSkillControllerStub($entityManager, $projectRepository, $projectSkillService);
    }

    private function createEntityManager(array $repositories): EntityManagerInterface
    {
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->method('getRepository')->willReturnCallback(function ($class) use ($repositories) {
            return $repositories[$class] ?? $this->createMock(EntityRepository::class);
        });

        return $entityManager;
    }

    private function makeUser(int $id): User
    {
        $user = new User();
        $user->setEmail('user@example.com')->setFirstname('John')->setLastname('Doe');
        $user->setCreatedAt(new \DateTimeImmutable('2024-01-01 10:00:00'));
        $user->setUpdatedAt(new \DateTimeImmutable('2024-01-02 10:00:00'));
        $this->setId($user, $id);

        return $user;
    }

    private function setId(object $entity, int $id): void
    {
        $reflection = new \ReflectionClass($entity);
        $prop = $reflection->getProperty('id');
        $prop->setAccessible(true);
        $prop->setValue($entity, $id);
    }
}

class ProjectSkillControllerStub extends ProjectSkillController
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

