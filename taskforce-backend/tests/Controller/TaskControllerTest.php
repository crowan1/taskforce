<?php

namespace App\Tests\Controller;

use App\Controller\TaskController;
use App\Entity\Project;
use App\Entity\ProjectUser;
use App\Entity\Skill;
use App\Entity\Task;
use App\Entity\User;
use App\Repository\AlertTaskRepository;
use App\Repository\ProjectRepository;
use App\Repository\TaskRepository;
use App\Service\ImageUploadService;
use App\Service\TaskAssignmentService;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class TaskControllerTest extends TestCase
{
    public function testGetTasksUsesProjectFilterWhenProvided(): void
    {
        $user = $this->makeUser(1, 'user@example.com');
        $task = $this->makeTask($user);
        $task->setProject($this->makeProject(10, $user));

        $taskRepository = $this->createMock(TaskRepository::class);
        $taskRepository->method('findByUserAndProject')->willReturn([$task]);

        $controller = $this->buildController($taskRepository);
        $controller->setUser($user);

        $request = new Request(['projectId' => 10]);
        $response = $controller->getTasks($request);

        $payload = json_decode($response->getContent(), true);
        $this->assertTrue($payload['success']);
        $this->assertCount(1, $payload['tasks']);
    }

    public function testGetTasksWithoutProjectId(): void
    {
        $user = $this->makeUser(1, 'user@example.com');
        $task = $this->makeTask($user);
        $task->setProject($this->makeProject(10, $user));

        $taskRepository = $this->createMock(TaskRepository::class);
        $taskRepository->method('findByUser')->willReturn([$task]);

        $controller = $this->buildController($taskRepository);
        $controller->setUser($user);

        $response = $controller->getTasks(new Request());
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
        $this->assertCount(1, $payload['tasks']);
    }

    public function testCreateTaskSuccess(): void
    {
        $user = $this->makeUser(1, 'creator@example.com');
        $project = $this->makeProject(10, $user);
        $assignedUser = $this->makeUser(2, 'assignee@example.com');
        $skill = new Skill();
        $skill->setName('PHP');

        $projectRepository = $this->createMock(EntityRepository::class);
        $projectRepository->method('find')->with(10)->willReturn($project);

        $userRepository = $this->createMock(EntityRepository::class);
        $userRepository->method('find')->with(2)->willReturn($assignedUser);

        $skillRepository = $this->createMock(EntityRepository::class);
        $skillRepository->method('find')->with(5)->willReturn($skill);

        $entityManager = $this->createEntityManager([
            Project::class => $projectRepository,
            User::class => $userRepository,
            Skill::class => $skillRepository
        ]);

        $entityManager->method('persist')->willReturnCallback(function ($entity) {
            if (method_exists($entity, 'setCreatedAtValue')) {
                $entity->setCreatedAtValue();
            }
        });

        $controller = $this->buildController($this->createMock(TaskRepository::class), $entityManager);
        $controller->setUser($user);

        $request = new Request([], [], [], [], [], [], json_encode([
            'title' => 'New Task',
            'projectId' => 10,
            'assignedTo' => 2,
            'skillIds' => [5],
            'dueDate' => '2024-03-01 10:00:00'
        ]));

        $response = $controller->createTask($request);
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
        $this->assertSame('New Task', $payload['task']['title']);
    }

    public function testCreateTaskProjectNotFound(): void
    {
        $user = $this->makeUser(1, 'creator@example.com');

        $projectRepository = $this->createMock(EntityRepository::class);
        $projectRepository->method('find')->with(10)->willReturn(null);

        $entityManager = $this->createEntityManager([
            Project::class => $projectRepository
        ]);

        $controller = $this->buildController($this->createMock(TaskRepository::class), $entityManager);
        $controller->setUser($user);

        $request = new Request([], [], [], [], [], [], json_encode([
            'title' => 'New Task',
            'projectId' => 10
        ]));

        $response = $controller->createTask($request);
        $payload = json_decode($response->getContent(), true);

        $this->assertFalse($payload['success']);
    }

    public function testCreateTaskMissingTitle(): void
    {
        $user = $this->makeUser(1, 'creator@example.com');
        $project = $this->makeProject(10, $user);

        $projectRepository = $this->createMock(EntityRepository::class);
        $projectRepository->method('find')->with(10)->willReturn($project);

        $entityManager = $this->createEntityManager([
            Project::class => $projectRepository
        ]);

        $controller = $this->buildController($this->createMock(TaskRepository::class), $entityManager);
        $controller->setUser($user);

        $request = new Request([], [], [], [], [], [], json_encode([
            'projectId' => 10
        ]));

        $response = $controller->createTask($request);
        $payload = json_decode($response->getContent(), true);

        $this->assertFalse($payload['success']);
    }

    public function testUpdateTaskSuccess(): void
    {
        $user = $this->makeUser(1, 'user@example.com');
        $project = $this->makeProject(10, $user);
        $task = $this->makeTask($user);
        $task->setProject($project);

        $taskRepository = $this->createMock(TaskRepository::class);
        $taskRepository->method('find')->with(55)->willReturn($task);

        $projectUser = new ProjectUser();
        $projectUser->setProject($project)->setUser($user);

        $projectUserRepository = $this->createMock(EntityRepository::class);
        $projectUserRepository->method('findOneBy')->willReturn($projectUser);

        $assignedUser = $this->makeUser(2, 'assignee@example.com');
        $userRepository = $this->createMock(EntityRepository::class);
        $userRepository->method('find')->with(2)->willReturn($assignedUser);

        $skill = new Skill();
        $skill->setName('PHP');
        $skillRepository = $this->createMock(EntityRepository::class);
        $skillRepository->method('find')->with(5)->willReturn($skill);

        $entityManager = $this->createEntityManager([
            'App\Entity\ProjectUser' => $projectUserRepository,
            User::class => $userRepository,
            Skill::class => $skillRepository
        ]);

        $controller = $this->buildController($taskRepository, $entityManager);
        $controller->setUser($user);

        $request = new Request([], [], [], [], [], [], json_encode([
            'title' => 'Updated',
            'description' => 'Desc',
            'status' => 'in_progress',
            'priority' => 'high',
            'level' => 'senior',
            'estimatedHours' => 3,
            'dueDate' => null,
            'assignedTo' => 2,
            'skillIds' => [5]
        ]));

        $response = $controller->updateTask(55, $request);
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
        $this->assertSame('Updated', $payload['task']['title']);
    }

    public function testUpdateTaskUnauthorized(): void
    {
        $user = $this->makeUser(1, 'user@example.com');
        $task = $this->makeTask($user);

        $taskRepository = $this->createMock(TaskRepository::class);
        $taskRepository->method('find')->with(55)->willReturn($task);

        $projectUserRepository = $this->createMock(EntityRepository::class);
        $projectUserRepository->method('findOneBy')->willReturn(null);

        $entityManager = $this->createEntityManager([
            'App\Entity\ProjectUser' => $projectUserRepository
        ]);

        $controller = $this->buildController($taskRepository, $entityManager);
        $controller->setUser($user);

        $request = new Request([], [], [], [], [], [], json_encode([
            'title' => 'Updated'
        ]));

        $response = $controller->updateTask(55, $request);
        $payload = json_decode($response->getContent(), true);

        $this->assertFalse($payload['success']);
    }

    public function testUpdateTaskNotFound(): void
    {
        $user = $this->makeUser(1, 'user@example.com');

        $taskRepository = $this->createMock(TaskRepository::class);
        $taskRepository->method('find')->with(55)->willReturn(null);

        $controller = $this->buildController($taskRepository);
        $controller->setUser($user);

        $response = $controller->updateTask(55, new Request());
        $payload = json_decode($response->getContent(), true);

        $this->assertFalse($payload['success']);
    }

    public function testGetProjectAlertsSuccess(): void
    {
        $user = $this->makeUser(1, 'user@example.com');
        $project = $this->makeProject(10, $user);
        $task = $this->makeTask($user);
        $task->setProject($project);
        $task->setDueDate(new \DateTimeImmutable('2024-01-01 10:00:00'));
        $this->setId($task, 55);

        $alert = new \App\Entity\AlertTask();
        $alert->setProject($project)->setUser($user)->setAlertType('overdue_task')->setAlertEntityId(55);

        $taskRepository = $this->createMock(TaskRepository::class);
        $taskRepository->method('findOverdueTasks')->willReturn([$task]);
        $taskRepository->method('find')->with(55)->willReturn($task);

        $projectRepository = $this->createMock(ProjectRepository::class);
        $projectRepository->method('find')->with(10)->willReturn($project);

        $projectUser = new ProjectUser();
        $projectUser->setProject($project)->setUser($user);
        $projectUserRepository = $this->createMock(EntityRepository::class);
        $projectUserRepository->method('findOneBy')->willReturn($projectUser);

        $alertRepository = $this->createMock(AlertTaskRepository::class);
        $alertRepository->method('findOverdueAlertsForProject')->willReturn([$alert]);

        $taskAssignmentService = $this->createMock(TaskAssignmentService::class);
        $taskAssignmentService->method('getWorkloadByUser')->willReturn([
            ['isOverloaded' => true]
        ]);

        $entityManager = $this->createEntityManager([
            'App\Entity\ProjectUser' => $projectUserRepository
        ]);

        $controller = $this->buildController(
            $taskRepository,
            $entityManager,
            $projectRepository,
            $taskAssignmentService,
            $alertRepository
        );
        $controller->setUser($user);

        $response = $controller->getProjectAlerts(10);
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
        $this->assertCount(1, $payload['overdueTasks']);
        $this->assertCount(1, $payload['overloadedUsers']);
    }

    public function testGetProjectAlertsProjectNotFound(): void
    {
        $user = $this->makeUser(1, 'user@example.com');

        $projectRepository = $this->createMock(ProjectRepository::class);
        $projectRepository->method('find')->with(10)->willReturn(null);

        $controller = $this->buildController(
            $this->createMock(TaskRepository::class),
            null,
            $projectRepository
        );
        $controller->setUser($user);

        $response = $controller->getProjectAlerts(10);
        $payload = json_decode($response->getContent(), true);

        $this->assertFalse($payload['success']);
    }

    public function testGetProjectAlertsUnauthorized(): void
    {
        $user = $this->makeUser(1, 'user@example.com');
        $project = $this->makeProject(10, $user);

        $projectRepository = $this->createMock(ProjectRepository::class);
        $projectRepository->method('find')->with(10)->willReturn($project);

        $projectUserRepository = $this->createMock(EntityRepository::class);
        $projectUserRepository->method('findOneBy')->willReturn(null);

        $entityManager = $this->createEntityManager([
            'App\Entity\ProjectUser' => $projectUserRepository
        ]);

        $controller = $this->buildController(
            $this->createMock(TaskRepository::class),
            $entityManager,
            $projectRepository
        );
        $controller->setUser($user);

        $response = $controller->getProjectAlerts(10);
        $payload = json_decode($response->getContent(), true);

        $this->assertFalse($payload['success']);
    }

    public function testDismissAlertSuccess(): void
    {
        $user = $this->makeUser(1, 'user@example.com');
        $project = $this->makeProject(10, $user);

        $projectRepository = $this->createMock(ProjectRepository::class);
        $projectRepository->method('find')->with(10)->willReturn($project);

        $projectUser = new ProjectUser();
        $projectUser->setProject($project)->setUser($user);
        $projectUserRepository = $this->createMock(EntityRepository::class);
        $projectUserRepository->method('findOneBy')->willReturn($projectUser);

        $alertRepository = $this->createMock(AlertTaskRepository::class);

        $entityManager = $this->createEntityManager([
            'App\Entity\ProjectUser' => $projectUserRepository
        ]);

        $controller = $this->buildController(
            $this->createMock(TaskRepository::class),
            $entityManager,
            $projectRepository,
            $this->createMock(TaskAssignmentService::class),
            $alertRepository
        );
        $controller->setUser($user);

        $request = new Request([], [], [], [], [], [], json_encode([
            'alertType' => 'overdue_task',
            'entityId' => 55
        ]));

        $response = $controller->dismissAlert(10, $request);
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
    }

    public function testDismissAlertInvalidType(): void
    {
        $user = $this->makeUser(1, 'user@example.com');
        $project = $this->makeProject(10, $user);

        $projectRepository = $this->createMock(ProjectRepository::class);
        $projectRepository->method('find')->with(10)->willReturn($project);

        $projectUser = new ProjectUser();
        $projectUser->setProject($project)->setUser($user);
        $projectUserRepository = $this->createMock(EntityRepository::class);
        $projectUserRepository->method('findOneBy')->willReturn($projectUser);

        $entityManager = $this->createEntityManager([
            'App\Entity\ProjectUser' => $projectUserRepository
        ]);

        $controller = $this->buildController(
            $this->createMock(TaskRepository::class),
            $entityManager,
            $projectRepository,
            $this->createMock(TaskAssignmentService::class),
            $this->createMock(AlertTaskRepository::class)
        );
        $controller->setUser($user);

        $request = new Request([], [], [], [], [], [], json_encode([
            'alertType' => 'unknown',
            'entityId' => null
        ]));

        $response = $controller->dismissAlert(10, $request);
        $payload = json_decode($response->getContent(), true);

        $this->assertFalse($payload['success']);
    }

    public function testDeleteTaskSuccess(): void
    {
        $user = $this->makeUser(1, 'user@example.com');
        $project = $this->makeProject(10, $user);
        $task = $this->makeTask($user);
        $task->setProject($project);

        $taskRepository = $this->createMock(TaskRepository::class);
        $taskRepository->method('find')->with(55)->willReturn($task);

        $projectUser = new ProjectUser();
        $projectUser->setProject($project)->setUser($user);
        $projectUserRepository = $this->createMock(EntityRepository::class);
        $projectUserRepository->method('findOneBy')->willReturn($projectUser);

        $entityManager = $this->createEntityManager([
            'App\Entity\ProjectUser' => $projectUserRepository
        ]);

        $controller = $this->buildController($taskRepository, $entityManager);
        $controller->setUser($user);

        $response = $controller->deleteTask(55);
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
    }

    public function testDeleteTaskNotFound(): void
    {
        $user = $this->makeUser(1, 'user@example.com');

        $taskRepository = $this->createMock(TaskRepository::class);
        $taskRepository->method('find')->with(55)->willReturn(null);

        $controller = $this->buildController($taskRepository);
        $controller->setUser($user);

        $response = $controller->deleteTask(55);
        $payload = json_decode($response->getContent(), true);

        $this->assertFalse($payload['success']);
    }

    public function testAssignTaskAutomaticallySuccess(): void
    {
        $user = $this->makeUser(1, 'user@example.com');
        $project = $this->makeProject(10, $user);
        $task = $this->makeTask($user);
        $task->setProject($project);

        $taskRepository = $this->createMock(TaskRepository::class);
        $taskRepository->method('find')->with(55)->willReturn($task);

        $projectUser = new ProjectUser();
        $projectUser->setProject($project)->setUser($user);
        $projectUserRepository = $this->createMock(EntityRepository::class);
        $projectUserRepository->method('findOneBy')->willReturn($projectUser);

        $assignedUser = $this->makeUser(2, 'assignee@example.com');
        $taskAssignmentService = $this->createMock(TaskAssignmentService::class);
        $taskAssignmentService->method('assignTaskAutomatically')->willReturn($assignedUser);

        $entityManager = $this->createEntityManager([
            'App\Entity\ProjectUser' => $projectUserRepository
        ]);

        $controller = $this->buildController(
            $taskRepository,
            $entityManager,
            $this->createMock(ProjectRepository::class),
            $taskAssignmentService
        );
        $controller->setUser($user);

        $response = $controller->assignTaskAutomatically(55);
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
        $this->assertSame('assignee@example.com', $payload['assignedTo']['email']);
    }

    public function testAssignTaskAutomaticallyNoUserAvailable(): void
    {
        $user = $this->makeUser(1, 'user@example.com');
        $project = $this->makeProject(10, $user);
        $task = $this->makeTask($user);
        $task->setProject($project);

        $taskRepository = $this->createMock(TaskRepository::class);
        $taskRepository->method('find')->with(55)->willReturn($task);

        $projectUser = new ProjectUser();
        $projectUser->setProject($project)->setUser($user);
        $projectUserRepository = $this->createMock(EntityRepository::class);
        $projectUserRepository->method('findOneBy')->willReturn($projectUser);

        $taskAssignmentService = $this->createMock(TaskAssignmentService::class);
        $taskAssignmentService->method('assignTaskAutomatically')->willReturn(null);

        $entityManager = $this->createEntityManager([
            'App\Entity\ProjectUser' => $projectUserRepository
        ]);

        $controller = $this->buildController(
            $taskRepository,
            $entityManager,
            $this->createMock(ProjectRepository::class),
            $taskAssignmentService
        );
        $controller->setUser($user);

        $response = $controller->assignTaskAutomatically(55);
        $payload = json_decode($response->getContent(), true);

        $this->assertFalse($payload['success']);
    }

    public function testAssignAllProjectTasksSuccess(): void
    {
        $user = $this->makeUser(1, 'user@example.com');
        $project = $this->makeProject(10, $user);

        $projectRepository = $this->createMock(ProjectRepository::class);
        $projectRepository->method('find')->with(10)->willReturn($project);

        $projectUser = new ProjectUser();
        $projectUser->setProject($project)->setUser($user);
        $projectUserRepository = $this->createMock(EntityRepository::class);
        $projectUserRepository->method('findOneBy')->willReturn($projectUser);

        $taskAssignmentService = $this->createMock(TaskAssignmentService::class);
        $taskAssignmentService->method('assignAllProjectTasks')->willReturn([
            ['taskId' => 1]
        ]);

        $entityManager = $this->createEntityManager([
            'App\Entity\ProjectUser' => $projectUserRepository
        ]);

        $controller = $this->buildController(
            $this->createMock(TaskRepository::class),
            $entityManager,
            $projectRepository,
            $taskAssignmentService
        );
        $controller->setUser($user);

        $response = $controller->assignAllProjectTasks(10);
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
        $this->assertCount(1, $payload['results']);
    }

    public function testAssignAllProjectTasksProjectNotFound(): void
    {
        $user = $this->makeUser(1, 'user@example.com');

        $projectRepository = $this->createMock(ProjectRepository::class);
        $projectRepository->method('find')->with(10)->willReturn(null);

        $controller = $this->buildController(
            $this->createMock(TaskRepository::class),
            null,
            $projectRepository
        );
        $controller->setUser($user);

        $response = $controller->assignAllProjectTasks(10);
        $payload = json_decode($response->getContent(), true);

        $this->assertFalse($payload['success']);
    }

    public function testGetProjectWorkloadSuccess(): void
    {
        $user = $this->makeUser(1, 'user@example.com');
        $project = $this->makeProject(10, $user);

        $projectRepository = $this->createMock(ProjectRepository::class);
        $projectRepository->method('find')->with(10)->willReturn($project);

        $projectUser = new ProjectUser();
        $projectUser->setProject($project)->setUser($user);
        $projectUserRepository = $this->createMock(EntityRepository::class);
        $projectUserRepository->method('findOneBy')->willReturn($projectUser);

        $taskAssignmentService = $this->createMock(TaskAssignmentService::class);
        $taskAssignmentService->method('getWorkloadByUser')->willReturn([
            ['userId' => 1, 'isOverloaded' => false]
        ]);

        $entityManager = $this->createEntityManager([
            'App\Entity\ProjectUser' => $projectUserRepository
        ]);

        $controller = $this->buildController(
            $this->createMock(TaskRepository::class),
            $entityManager,
            $projectRepository,
            $taskAssignmentService
        );
        $controller->setUser($user);

        $response = $controller->getProjectWorkload(10);
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
        $this->assertCount(1, $payload['workload']);
    }

    public function testGetProjectWorkloadProjectNotFound(): void
    {
        $user = $this->makeUser(1, 'user@example.com');

        $projectRepository = $this->createMock(ProjectRepository::class);
        $projectRepository->method('find')->with(10)->willReturn(null);

        $controller = $this->buildController(
            $this->createMock(TaskRepository::class),
            null,
            $projectRepository
        );
        $controller->setUser($user);

        $response = $controller->getProjectWorkload(10);
        $payload = json_decode($response->getContent(), true);

        $this->assertFalse($payload['success']);
    }

    public function testFinishTaskSuccess(): void
    {
        $user = $this->makeUser(1, 'user@example.com');
        $project = $this->makeProject(10, $user);
        $task = $this->makeTask($user);
        $task->setProject($project);
        $task->setAssignedTo($user);

        $taskRepository = $this->createMock(TaskRepository::class);
        $taskRepository->method('find')->with(55)->willReturn($task);

        $projectUser = new ProjectUser();
        $projectUser->setProject($project)->setUser($user);
        $projectUserRepository = $this->createMock(EntityRepository::class);
        $projectUserRepository->method('findOneBy')->willReturn($projectUser);

        $entityManager = $this->createEntityManager([
            'App\Entity\ProjectUser' => $projectUserRepository
        ]);

        $controller = $this->buildController($taskRepository, $entityManager);
        $controller->setUser($user);

        $response = $controller->finishTask(55);
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
        $this->assertTrue($payload['task']['isFinished']);
    }

    public function testUploadTaskImageSuccess(): void
    {
        $user = $this->makeUser(1, 'user@example.com');
        $project = $this->makeProject(10, $user);
        $task = $this->makeTask($user);
        $task->setProject($project);

        $taskRepository = $this->createMock(TaskRepository::class);
        $taskRepository->method('find')->with(55)->willReturn($task);

        $projectUser = new ProjectUser();
        $projectUser->setProject($project)->setUser($user);
        $projectUserRepository = $this->createMock(EntityRepository::class);
        $projectUserRepository->method('findOneBy')->willReturn($projectUser);

        $imageUploadService = $this->createMock(ImageUploadService::class);
        $imageUploadService->method('uploadImage')->willReturn('uploads/tasks/55/file.png');
        $imageUploadService->method('getImageUrl')->willReturn('/uploads/tasks/55/file.png');

        $entityManager = $this->createEntityManager([
            'App\Entity\ProjectUser' => $projectUserRepository
        ]);

        $controller = $this->buildController(
            $taskRepository,
            $entityManager,
            $this->createMock(ProjectRepository::class),
            $this->createMock(TaskAssignmentService::class),
            $this->createMock(AlertTaskRepository::class),
            $imageUploadService
        );
        $controller->setUser($user);

        $uploadedFile = $this->createMock(\Symfony\Component\HttpFoundation\File\UploadedFile::class);
        $uploadedFile->method('getMimeType')->willReturn('image/png');
        $uploadedFile->method('getSize')->willReturn(1024);

        $request = new Request([], [], [], [], ['image' => $uploadedFile]);
        $response = $controller->uploadTaskImage(55, $request);
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
        $this->assertSame('/uploads/tasks/55/file.png', $payload['imageUrl']);
    }

    public function testUploadTaskImageRejectsInvalidType(): void
    {
        $user = $this->makeUser(1, 'user@example.com');
        $project = $this->makeProject(10, $user);
        $task = $this->makeTask($user);
        $task->setProject($project);

        $taskRepository = $this->createMock(TaskRepository::class);
        $taskRepository->method('find')->with(55)->willReturn($task);

        $projectUser = new ProjectUser();
        $projectUser->setProject($project)->setUser($user);
        $projectUserRepository = $this->createMock(EntityRepository::class);
        $projectUserRepository->method('findOneBy')->willReturn($projectUser);

        $entityManager = $this->createEntityManager([
            'App\Entity\ProjectUser' => $projectUserRepository
        ]);

        $controller = $this->buildController(
            $taskRepository,
            $entityManager
        );
        $controller->setUser($user);

        $uploadedFile = $this->createMock(\Symfony\Component\HttpFoundation\File\UploadedFile::class);
        $uploadedFile->method('getMimeType')->willReturn('text/plain');
        $uploadedFile->method('getSize')->willReturn(1024);

        $request = new Request([], [], [], [], ['image' => $uploadedFile]);
        $response = $controller->uploadTaskImage(55, $request);
        $payload = json_decode($response->getContent(), true);

        $this->assertFalse($payload['success']);
    }

    public function testUploadTaskImageRejectsLargeFile(): void
    {
        $user = $this->makeUser(1, 'user@example.com');
        $project = $this->makeProject(10, $user);
        $task = $this->makeTask($user);
        $task->setProject($project);

        $taskRepository = $this->createMock(TaskRepository::class);
        $taskRepository->method('find')->with(55)->willReturn($task);

        $projectUser = new ProjectUser();
        $projectUser->setProject($project)->setUser($user);
        $projectUserRepository = $this->createMock(EntityRepository::class);
        $projectUserRepository->method('findOneBy')->willReturn($projectUser);

        $entityManager = $this->createEntityManager([
            'App\Entity\ProjectUser' => $projectUserRepository
        ]);

        $controller = $this->buildController(
            $taskRepository,
            $entityManager
        );
        $controller->setUser($user);

        $uploadedFile = $this->createMock(\Symfony\Component\HttpFoundation\File\UploadedFile::class);
        $uploadedFile->method('getMimeType')->willReturn('image/png');
        $uploadedFile->method('getSize')->willReturn(6 * 1024 * 1024);

        $request = new Request([], [], [], [], ['image' => $uploadedFile]);
        $response = $controller->uploadTaskImage(55, $request);
        $payload = json_decode($response->getContent(), true);

        $this->assertFalse($payload['success']);
    }

    public function testUploadTaskImageMissingFile(): void
    {
        $user = $this->makeUser(1, 'user@example.com');
        $project = $this->makeProject(10, $user);
        $task = $this->makeTask($user);
        $task->setProject($project);

        $taskRepository = $this->createMock(TaskRepository::class);
        $taskRepository->method('find')->with(55)->willReturn($task);

        $projectUser = new ProjectUser();
        $projectUser->setProject($project)->setUser($user);
        $projectUserRepository = $this->createMock(EntityRepository::class);
        $projectUserRepository->method('findOneBy')->willReturn($projectUser);

        $entityManager = $this->createEntityManager([
            'App\Entity\ProjectUser' => $projectUserRepository
        ]);

        $controller = $this->buildController($taskRepository, $entityManager);
        $controller->setUser($user);

        $response = $controller->uploadTaskImage(55, new Request());
        $payload = json_decode($response->getContent(), true);

        $this->assertFalse($payload['success']);
    }

    public function testDeleteTaskImageSuccess(): void
    {
        $user = $this->makeUser(1, 'user@example.com');
        $project = $this->makeProject(10, $user);
        $task = $this->makeTask($user);
        $task->setProject($project);
        $task->addImage('uploads/tasks/55/file.png');

        $taskRepository = $this->createMock(TaskRepository::class);
        $taskRepository->method('find')->with(55)->willReturn($task);

        $projectUser = new ProjectUser();
        $projectUser->setProject($project)->setUser($user);
        $projectUserRepository = $this->createMock(EntityRepository::class);
        $projectUserRepository->method('findOneBy')->willReturn($projectUser);

        $imageUploadService = $this->createMock(ImageUploadService::class);
        $imageUploadService->method('deleteImage')->willReturn(true);

        $entityManager = $this->createEntityManager([
            'App\Entity\ProjectUser' => $projectUserRepository
        ]);

        $controller = $this->buildController(
            $taskRepository,
            $entityManager,
            $this->createMock(ProjectRepository::class),
            $this->createMock(TaskAssignmentService::class),
            $this->createMock(AlertTaskRepository::class),
            $imageUploadService
        );
        $controller->setUser($user);

        $request = new Request([], [], [], [], [], [], json_encode([
            'imagePath' => 'uploads/tasks/55/file.png'
        ]));

        $response = $controller->deleteTaskImage(55, $request);
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
    }

    public function testDeleteTaskImageMissingPath(): void
    {
        $user = $this->makeUser(1, 'user@example.com');
        $project = $this->makeProject(10, $user);
        $task = $this->makeTask($user);
        $task->setProject($project);

        $taskRepository = $this->createMock(TaskRepository::class);
        $taskRepository->method('find')->with(55)->willReturn($task);

        $projectUser = new ProjectUser();
        $projectUser->setProject($project)->setUser($user);
        $projectUserRepository = $this->createMock(EntityRepository::class);
        $projectUserRepository->method('findOneBy')->willReturn($projectUser);

        $entityManager = $this->createEntityManager([
            'App\Entity\ProjectUser' => $projectUserRepository
        ]);

        $controller = $this->buildController($taskRepository, $entityManager);
        $controller->setUser($user);

        $response = $controller->deleteTaskImage(55, new Request());
        $payload = json_decode($response->getContent(), true);

        $this->assertFalse($payload['success']);
    }

    public function testDeleteTaskImageFailure(): void
    {
        $user = $this->makeUser(1, 'user@example.com');
        $project = $this->makeProject(10, $user);
        $task = $this->makeTask($user);
        $task->setProject($project);
        $task->addImage('uploads/tasks/55/file.png');

        $taskRepository = $this->createMock(TaskRepository::class);
        $taskRepository->method('find')->with(55)->willReturn($task);

        $projectUser = new ProjectUser();
        $projectUser->setProject($project)->setUser($user);
        $projectUserRepository = $this->createMock(EntityRepository::class);
        $projectUserRepository->method('findOneBy')->willReturn($projectUser);

        $imageUploadService = $this->createMock(ImageUploadService::class);
        $imageUploadService->method('deleteImage')->willReturn(false);

        $entityManager = $this->createEntityManager([
            'App\Entity\ProjectUser' => $projectUserRepository
        ]);

        $controller = $this->buildController(
            $taskRepository,
            $entityManager,
            $this->createMock(ProjectRepository::class),
            $this->createMock(TaskAssignmentService::class),
            $this->createMock(AlertTaskRepository::class),
            $imageUploadService
        );
        $controller->setUser($user);

        $request = new Request([], [], [], [], [], [], json_encode([
            'imagePath' => 'uploads/tasks/55/file.png'
        ]));

        $response = $controller->deleteTaskImage(55, $request);
        $payload = json_decode($response->getContent(), true);

        $this->assertFalse($payload['success']);
    }

    private function buildController(
        TaskRepository $taskRepository,
        ?EntityManagerInterface $entityManager = null,
        ?ProjectRepository $projectRepository = null,
        ?TaskAssignmentService $taskAssignmentService = null,
        ?AlertTaskRepository $alertTaskRepository = null,
        ?ImageUploadService $imageUploadService = null
    ): TaskControllerStub {
        $entityManager ??= $this->createMock(EntityManagerInterface::class);
        $projectRepository ??= $this->createMock(ProjectRepository::class);
        $taskAssignmentService ??= $this->createMock(TaskAssignmentService::class);
        $alertTaskRepository ??= $this->createMock(AlertTaskRepository::class);
        $imageUploadService ??= $this->createMock(ImageUploadService::class);

        return new TaskControllerStub(
            $entityManager,
            $taskRepository,
            $projectRepository,
            $taskAssignmentService,
            $alertTaskRepository,
            $imageUploadService
        );
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

    private function makeTask(User $createdBy): Task
    {
        $task = new Task();
        $task->setTitle('Task');
        $task->setCreatedBy($createdBy);
        $task->setCreatedAt(new \DateTimeImmutable('2024-01-01 10:00:00'));
        $task->setUpdatedAt(new \DateTimeImmutable('2024-01-02 10:00:00'));

        return $task;
    }

    private function setId(object $entity, int $id): void
    {
        $reflection = new \ReflectionClass($entity);
        $prop = $reflection->getProperty('id');
        $prop->setAccessible(true);
        $prop->setValue($entity, $id);
    }
}

class TaskControllerStub extends TaskController
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

