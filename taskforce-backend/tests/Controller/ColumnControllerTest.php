<?php

namespace App\Tests\Controller;

use App\Controller\ColumnController;
use App\Entity\Column;
use App\Entity\Project;
use App\Entity\ProjectUser;
use App\Entity\User;
use App\Repository\ColumnRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class ColumnControllerTest extends TestCase
{
    public function testGetColumnsSuccess(): void
    {
        $project = new Project();
        $project->setName('Project');
        $column = new Column();
        $column->setName('Todo')->setProject($project);
        $column->setCreatedAt(new \DateTimeImmutable('2024-01-01 10:00:00'));
        $column->setUpdatedAt(new \DateTimeImmutable('2024-01-02 10:00:00'));

        $columnRepository = $this->createMock(ColumnRepository::class);
        $columnRepository->method('findByProject')->with(10)->willReturn([$column]);

        $controller = $this->buildController($columnRepository);
        $request = new Request(['projectId' => 10]);

        $response = $controller->getColumns($request);
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
        $this->assertCount(1, $payload['columns']);
    }

    public function testGetColumnsMissingProjectId(): void
    {
        $controller = $this->buildController($this->createMock(ColumnRepository::class));
        $response = $controller->getColumns(new Request());
        $payload = json_decode($response->getContent(), true);

        $this->assertFalse($payload['success']);
    }

    public function testGetColumnsRepositoryError(): void
    {
        $columnRepository = $this->createMock(ColumnRepository::class);
        $columnRepository->method('findByProject')->willThrowException(new \RuntimeException('DB error'));

        $controller = $this->buildController($columnRepository);
        $request = new Request(['projectId' => 10]);

        $response = $controller->getColumns($request);
        $payload = json_decode($response->getContent(), true);

        $this->assertFalse($payload['success']);
    }

    public function testCreateColumnSuccess(): void
    {
        $project = new Project();
        $project->setName('Project');

        $projectRepository = $this->createMock(EntityRepository::class);
        $projectRepository->method('find')->with(10)->willReturn($project);

        $entityManager = $this->createEntityManager([
            Project::class => $projectRepository
        ]);
        $entityManager->method('persist')->willReturnCallback(function ($entity) {
            if (method_exists($entity, 'setCreatedAtValue')) {
                $entity->setCreatedAtValue();
            }
        });

        $controller = $this->buildController($this->createMock(ColumnRepository::class), $entityManager);
        $request = new Request([], [], [], [], [], [], json_encode([
            'name' => 'Todo',
            'projectId' => 10
        ]));

        $response = $controller->createColumn($request);
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
        $this->assertSame('Todo', $payload['column']['name']);
    }

    public function testCreateColumnProjectNotFound(): void
    {
        $projectRepository = $this->createMock(EntityRepository::class);
        $projectRepository->method('find')->willReturn(null);

        $entityManager = $this->createEntityManager([
            Project::class => $projectRepository
        ]);

        $controller = $this->buildController($this->createMock(ColumnRepository::class), $entityManager);
        $request = new Request([], [], [], [], [], [], json_encode([
            'name' => 'Todo',
            'projectId' => 10
        ]));

        $response = $controller->createColumn($request);
        $payload = json_decode($response->getContent(), true);

        $this->assertFalse($payload['success']);
    }

    public function testCreateColumnInvalidPayload(): void
    {
        $controller = $this->buildController($this->createMock(ColumnRepository::class));
        $request = new Request([], [], [], [], [], [], json_encode([]));

        $response = $controller->createColumn($request);
        $payload = json_decode($response->getContent(), true);

        $this->assertFalse($payload['success']);
    }

    public function testCreateColumnMissingName(): void
    {
        $project = new Project();
        $project->setName('Project');

        $projectRepository = $this->createMock(EntityRepository::class);
        $projectRepository->method('find')->with(10)->willReturn($project);

        $entityManager = $this->createEntityManager([
            Project::class => $projectRepository
        ]);

        $controller = $this->buildController($this->createMock(ColumnRepository::class), $entityManager);
        $request = new Request([], [], [], [], [], [], json_encode([
            'projectId' => 10
        ]));

        $response = $controller->createColumn($request);
        $payload = json_decode($response->getContent(), true);

        $this->assertFalse($payload['success']);
    }

    public function testCreateColumnMissingProjectId(): void
    {
        $controller = $this->buildController($this->createMock(ColumnRepository::class));
        $request = new Request([], [], [], [], [], [], json_encode([
            'name' => 'Todo'
        ]));

        $response = $controller->createColumn($request);
        $payload = json_decode($response->getContent(), true);

        $this->assertFalse($payload['success']);
    }

    public function testUpdateColumnSuccess(): void
    {
        $user = new User();
        $column = new Column();
        $column->setName('Todo');
        $column->setProject(new Project());

        $columnRepository = $this->createMock(ColumnRepository::class);
        $columnRepository->method('find')->with(5)->willReturn($column);

        $projectUser = new ProjectUser();
        $projectUser->setUser($user)->setProject($column->getProject());
        $projectUserRepository = $this->createMock(EntityRepository::class);
        $projectUserRepository->method('findOneBy')->willReturn($projectUser);

        $entityManager = $this->createEntityManager([
            'App\Entity\ProjectUser' => $projectUserRepository
        ]);

        $controller = $this->buildController($columnRepository, $entityManager);
        $controller->setUser($user);

        $request = new Request([], [], [], [], [], [], json_encode([
            'name' => 'Updated',
            'position' => -5,
            'isActive' => false
        ]));

        $response = $controller->updateColumn(5, $request);
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
        $this->assertSame('Updated', $payload['column']['name']);
        $this->assertSame(0, $payload['column']['position']);
    }

    public function testUpdateColumnSetsIdentifierColorDescription(): void
    {
        $user = new User();
        $column = new Column();
        $column->setName('Todo');
        $column->setProject(new Project());

        $columnRepository = $this->createMock(ColumnRepository::class);
        $columnRepository->method('find')->with(5)->willReturn($column);

        $projectUser = new ProjectUser();
        $projectUser->setUser($user)->setProject($column->getProject());
        $projectUserRepository = $this->createMock(EntityRepository::class);
        $projectUserRepository->method('findOneBy')->willReturn($projectUser);

        $entityManager = $this->createEntityManager([
            'App\Entity\ProjectUser' => $projectUserRepository
        ]);

        $controller = $this->buildController($columnRepository, $entityManager);
        $controller->setUser($user);

        $request = new Request([], [], [], [], [], [], json_encode([
            'identifier' => 'todo',
            'color' => '#ffffff',
            'description' => 'Desc'
        ]));

        $response = $controller->updateColumn(5, $request);
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
    }

    public function testUpdateColumnConflictIgnored(): void
    {
        $user = new User();
        $column = new Column();
        $column->setName('Todo');
        $column->setProject(new Project());

        $columnRepository = $this->createMock(ColumnRepository::class);
        $columnRepository->method('find')->with(5)->willReturn($column);

        $projectUser = new ProjectUser();
        $projectUser->setUser($user)->setProject($column->getProject());
        $projectUserRepository = $this->createMock(EntityRepository::class);
        $projectUserRepository->method('findOneBy')->willReturn($projectUser);

        $entityManager = $this->createEntityManager([
            'App\Entity\ProjectUser' => $projectUserRepository
        ]);
        $entityManager->method('flush')->willThrowException(new \RuntimeException('constraint violation'));

        $controller = $this->buildController($columnRepository, $entityManager);
        $controller->setUser($user);

        $request = new Request([], [], [], [], [], [], json_encode([
            'name' => 'Updated'
        ]));

        $response = $controller->updateColumn(5, $request);
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
    }

    public function testUpdateColumnReturnsServerError(): void
    {
        $user = new User();
        $column = new Column();
        $column->setName('Todo');
        $column->setProject(new Project());

        $columnRepository = $this->createMock(ColumnRepository::class);
        $columnRepository->method('find')->with(5)->willReturn($column);

        $projectUser = new ProjectUser();
        $projectUser->setUser($user)->setProject($column->getProject());
        $projectUserRepository = $this->createMock(EntityRepository::class);
        $projectUserRepository->method('findOneBy')->willReturn($projectUser);

        $entityManager = $this->createEntityManager([
            'App\Entity\ProjectUser' => $projectUserRepository
        ]);
        $entityManager->method('flush')->willThrowException(new \RuntimeException('unexpected error'));

        $controller = $this->buildController($columnRepository, $entityManager);
        $controller->setUser($user);

        $request = new Request([], [], [], [], [], [], json_encode(['name' => 'Updated']));
        $response = $controller->updateColumn(5, $request);
        $payload = json_decode($response->getContent(), true);

        $this->assertFalse($payload['success']);
    }

    public function testUpdateColumnNotFound(): void
    {
        $columnRepository = $this->createMock(ColumnRepository::class);
        $columnRepository->method('find')->with(5)->willReturn(null);

        $controller = $this->buildController($columnRepository);
        $controller->setUser(new User());

        $request = new Request([], [], [], [], [], [], json_encode(['name' => 'Updated']));
        $response = $controller->updateColumn(5, $request);
        $payload = json_decode($response->getContent(), true);

        $this->assertFalse($payload['success']);
    }

    public function testUpdateColumnUnauthorized(): void
    {
        $user = new User();
        $column = new Column();
        $column->setName('Todo');
        $column->setProject(new Project());

        $columnRepository = $this->createMock(ColumnRepository::class);
        $columnRepository->method('find')->with(5)->willReturn($column);

        $projectUserRepository = $this->createMock(EntityRepository::class);
        $projectUserRepository->method('findOneBy')->willReturn(null);

        $entityManager = $this->createEntityManager([
            'App\Entity\ProjectUser' => $projectUserRepository
        ]);

        $controller = $this->buildController($columnRepository, $entityManager);
        $controller->setUser($user);

        $request = new Request([], [], [], [], [], [], json_encode(['name' => 'Updated']));
        $response = $controller->updateColumn(5, $request);
        $payload = json_decode($response->getContent(), true);

        $this->assertFalse($payload['success']);
    }

    public function testDeleteColumnSuccess(): void
    {
        $column = new Column();

        $columnRepository = $this->createMock(ColumnRepository::class);
        $columnRepository->method('find')->with(5)->willReturn($column);

        $entityManager = $this->createMock(EntityManagerInterface::class);
        $controller = $this->buildController($columnRepository, $entityManager);

        $response = $controller->deleteColumn(5);
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
    }

    public function testDeleteColumnNotFound(): void
    {
        $columnRepository = $this->createMock(ColumnRepository::class);
        $columnRepository->method('find')->with(5)->willReturn(null);

        $controller = $this->buildController($columnRepository);
        $response = $controller->deleteColumn(5);
        $payload = json_decode($response->getContent(), true);

        $this->assertFalse($payload['success']);
    }

    private function buildController(
        ColumnRepository $columnRepository,
        ?EntityManagerInterface $entityManager = null
    ): ColumnControllerStub {
        $entityManager ??= $this->createMock(EntityManagerInterface::class);

        return new ColumnControllerStub($entityManager, $columnRepository);
    }

    private function createEntityManager(array $repositories): EntityManagerInterface
    {
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->method('getRepository')->willReturnCallback(function ($class) use ($repositories) {
            return $repositories[$class] ?? $this->createMock(EntityRepository::class);
        });

        return $entityManager;
    }
}

class ColumnControllerStub extends ColumnController
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

