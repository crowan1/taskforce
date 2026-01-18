<?php

namespace App\Tests\Service;

use App\Entity\Project;
use App\Entity\ProjectUser;
use App\Entity\Skill;
use App\Entity\Task;
use App\Entity\User;
use App\Entity\UserSkill;
use App\Repository\ProjectUserRepository;
use App\Repository\TaskRepository;
use App\Repository\UserSkillRepository;
use App\Service\TaskAssignmentService;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;

class TaskAssignmentServiceTest extends TestCase
{
    public function testAssignTaskAutomaticallyReturnsNullWhenNoUsers(): void
    {
        $service = $this->buildService([], []);
        $task = $this->createMock(Task::class);
        $project = $this->createMock(Project::class);

        $task->method('getProject')->willReturn($project);
        $project->method('getId')->willReturn(1);

        $this->assertNull($service->assignTaskAutomatically($task));
    }

    public function testAssignTaskAutomaticallyUsesFallbackWhenOverloaded(): void
    {
        $user = $this->createMock(User::class);
        $user->method('getId')->willReturn(1);
        $user->method('getMaxWorkloadHours')->willReturn(1.0);
        $user->method('getFirstname')->willReturn('John');
        $user->method('getLastname')->willReturn('Doe');

        $projectUser = $this->createMock(ProjectUser::class);
        $projectUser->method('getUser')->willReturn($user);

        $existingTask = $this->createMock(Task::class);
        $existingTask->method('getEstimatedHours')->willReturn(5.0);
        $existingTask->method('isFinished')->willReturn(false);

        $service = $this->buildService([$projectUser], [$existingTask]);
        $task = $this->createMock(Task::class);
        $project = $this->createMock(Project::class);

        $task->method('getProject')->willReturn($project);
        $task->method('getEstimatedHours')->willReturn(5.0);
        $task->method('getRequiredSkills')->willReturn(new ArrayCollection());
        $project->method('getId')->willReturn(1);

        $task->expects($this->once())->method('setAssignedTo')->with($user);

        $this->assertSame($user, $service->assignTaskAutomatically($task));
    }

    public function testAssignTaskAutomaticallyReturnsNullWhenScoreIsZero(): void
    {
        $user = $this->createMock(User::class);
        $user->method('getId')->willReturn(1);
        $user->method('getMaxWorkloadHours')->willReturn(10.0);

        $projectUser = $this->createMock(ProjectUser::class);
        $projectUser->method('getUser')->willReturn($user);

        $heavyTask = $this->createMock(Task::class);
        $heavyTask->method('getEstimatedHours')->willReturn(10.0);
        $heavyTask->method('isFinished')->willReturn(false);

        $service = $this->buildService([$projectUser], [$heavyTask]);
        $task = $this->createMock(Task::class);
        $project = $this->createMock(Project::class);

        $task->method('getProject')->willReturn($project);
        $task->method('getEstimatedHours')->willReturn(10.0);
        $task->method('getRequiredSkills')->willReturn(new ArrayCollection([
            $this->createMock(Skill::class)
        ]));
        $project->method('getId')->willReturn(1);

        $this->assertNull($service->assignTaskAutomatically($task));
    }

    public function testAssignTaskAutomaticallyAssignsUser(): void
    {
        $user = $this->createMock(User::class);
        $user->method('getId')->willReturn(1);
        $user->method('getMaxWorkloadHours')->willReturn(40.0);
        $user->method('getFirstname')->willReturn('John');
        $user->method('getLastname')->willReturn('Doe');

        $projectUser = $this->createMock(ProjectUser::class);
        $projectUser->method('getUser')->willReturn($user);

        $service = $this->buildService([$projectUser], []);
        $task = $this->createMock(Task::class);
        $project = $this->createMock(Project::class);

        $task->method('getProject')->willReturn($project);
        $task->method('getEstimatedHours')->willReturn(1.0);
        $task->method('getRequiredSkills')->willReturn(new ArrayCollection());
        $project->method('getId')->willReturn(1);

        $task->expects($this->once())->method('setAssignedTo')->with($user);
        $task->expects($this->once())->method('setAssignmentScore')->with($this->isType('float'));

        $result = $service->assignTaskAutomatically($task);

        $this->assertSame($user, $result);
    }

    public function testGetWorkloadByUserReturnsData(): void
    {
        $user = $this->createMock(User::class);
        $user->method('getId')->willReturn(1);
        $user->method('getFirstname')->willReturn('John');
        $user->method('getLastname')->willReturn('Doe');
        $user->method('getMaxWorkloadHours')->willReturn(40.0);
        $user->method('getEmail')->willReturn('john@example.com');

        $projectUser = $this->createMock(ProjectUser::class);
        $projectUser->method('getUser')->willReturn($user);

        $task = $this->createMock(Task::class);
        $task->method('getEstimatedHours')->willReturn(10.0);
        $task->method('getStatus')->willReturn('todo');
        $task->method('getId')->willReturn(1);
        $task->method('getTitle')->willReturn('Task');
        $task->method('getPriority')->willReturn('high');

        $service = $this->buildService([$projectUser], [$task]);
        $project = $this->createMock(Project::class);
        $project->method('getId')->willReturn(1);

        $workload = $service->getWorkloadByUser($project);

        $this->assertCount(1, $workload);
        $this->assertSame(1, $workload[0]['userId']);
        $this->assertSame(10.0, $workload[0]['totalHours']);
    }

    public function testCalculatePriorityBonus(): void
    {
        $service = $this->buildService([], []);
        $task = $this->createMock(Task::class);
        $task->method('getPriority')->willReturn('high');

        $method = new \ReflectionMethod($service, 'calculatePriorityBonus');
        $method->setAccessible(true);

        $this->assertSame(1.0, $method->invoke($service, $task));
    }

    public function testCalculateSkillMatchScore(): void
    {
        $skill = $this->createMock(Skill::class);
        $skill->method('getName')->willReturn('PHP');

        $task = $this->createMock(Task::class);
        $task->method('getRequiredSkills')->willReturn(new ArrayCollection([$skill]));

        $user = $this->createMock(User::class);
        $user->method('getId')->willReturn(1);

        $service = $this->buildService([], []);

        $method = new \ReflectionMethod($service, 'calculateSkillMatchScore');
        $method->setAccessible(true);

        $score = $method->invoke($service, $task, $user);
        $this->assertSame(1.0, $score);
    }

    public function testCalculateSkillMatchScoreEmpty(): void
    {
        $task = $this->createMock(Task::class);
        $task->method('getRequiredSkills')->willReturn(new ArrayCollection());

        $user = $this->createMock(User::class);
        $user->method('getId')->willReturn(1);

        $service = $this->buildService([], []);

        $method = new \ReflectionMethod($service, 'calculateSkillMatchScore');
        $method->setAccessible(true);

        $score = $method->invoke($service, $task, $user);
        $this->assertSame(0.5, $score);
    }

    public function testCalculateWorkloadScore(): void
    {
        $user = $this->createMock(User::class);
        $user->method('getMaxWorkloadHours')->willReturn(40.0);

        $task = $this->createMock(Task::class);
        $task->method('getEstimatedHours')->willReturn(10.0);
        $task->method('isFinished')->willReturn(false);

        $service = $this->buildService([], [$task]);
        $project = $this->createMock(Project::class);

        $method = new \ReflectionMethod($service, 'calculateWorkloadScore');
        $method->setAccessible(true);

        $score = $method->invoke($service, $user, $project);
        $this->assertSame(1.0, $score);
    }

    public function testCalculateWorkloadScoreThresholds(): void
    {
        $user = $this->createMock(User::class);
        $user->method('getMaxWorkloadHours')->willReturn(10.0);

        $project = $this->createMock(Project::class);

        $method = new \ReflectionMethod($this->buildService([], []), 'calculateWorkloadScore');
        $method->setAccessible(true);

        $scoreFull = $method->invoke($this->buildService([], [$this->taskWithHours(10.0)]), $user, $project);
        $scoreHigh = $method->invoke($this->buildService([], [$this->taskWithHours(9.0)]), $user, $project);
        $scoreMid = $method->invoke($this->buildService([], [$this->taskWithHours(7.5)]), $user, $project);
        $scoreLow = $method->invoke($this->buildService([], [$this->taskWithHours(5.0)]), $user, $project);
        $scoreFree = $method->invoke($this->buildService([], [$this->taskWithHours(1.0)]), $user, $project);

        $this->assertSame(0.0, $scoreFull);
        $this->assertSame(0.1, $scoreHigh);
        $this->assertSame(0.3, $scoreMid);
        $this->assertSame(0.6, $scoreLow);
        $this->assertSame(1.0, $scoreFree);
    }

    public function testAssignAllProjectTasksReturnsEmpty(): void
    {
        $service = $this->buildService([], []);
        $project = $this->createMock(Project::class);
        $project->method('getId')->willReturn(1);

        $result = $service->assignAllProjectTasks($project);

        $this->assertSame([], $result);
    }

    public function testCalculateAssignmentScore(): void
    {
        $service = $this->buildService([], []);
        $task = $this->createMock(Task::class);
        $task->method('getRequiredSkills')->willReturn(new ArrayCollection());
        $task->method('getProject')->willReturn($this->createMock(Project::class));

        $user = $this->createMock(User::class);
        $user->method('getId')->willReturn(1);
        $user->method('getMaxWorkloadHours')->willReturn(40.0);

        $method = new \ReflectionMethod($service, 'calculateAssignmentScore');
        $method->setAccessible(true);

        $score = $method->invoke($service, $task, $user);
        $this->assertIsFloat($score);
    }

    public function testGetCurrentWorkloadHours(): void
    {
        $task = $this->createMock(Task::class);
        $task->method('isFinished')->willReturn(false);
        $task->method('getEstimatedHours')->willReturn(5.0);

        $service = $this->buildService([], [$task]);
        $project = $this->createMock(Project::class);
        $user = $this->createMock(User::class);

        $method = new \ReflectionMethod($service, 'getCurrentWorkloadHours');
        $method->setAccessible(true);

        $hours = $method->invoke($service, $user, $project);
        $this->assertSame(5.0, $hours);
    }

    private function buildService(array $projectUsers, array $tasks): TaskAssignmentService
    {
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $taskRepository = $this->createMock(TaskRepository::class);
        $userSkillRepository = $this->createMock(UserSkillRepository::class);
        $projectUserRepository = $this->createMock(ProjectUserRepository::class);

        $projectUserRepository->method('findByProject')->willReturn($projectUsers);
        $taskRepository->method('findBy')->willReturn($tasks);
        $userSkillRepository->method('findByUser')->willReturn([
            $this->buildUserSkill('PHP')
        ]);

        return new TaskAssignmentService($entityManager, $taskRepository, $userSkillRepository, $projectUserRepository);
    }

    private function buildUserSkill(string $name): UserSkill
    {
        $skill = new Skill();
        $skill->setName($name);
        $userSkill = new UserSkill();
        $userSkill->setSkill($skill);

        return $userSkill;
    }

    private function taskWithHours(float $hours): Task
    {
        $task = $this->createMock(Task::class);
        $task->method('getEstimatedHours')->willReturn($hours);
        $task->method('isFinished')->willReturn(false);

        return $task;
    }
}

