<?php

namespace App\Tests\Service;

use App\Service\TaskAssignmentService;
use App\Entity\Task;
use App\Entity\User;
use App\Entity\Project;
use App\Entity\Skill;
use App\Entity\ProjectUser;
use App\Entity\UserSkill;
use App\Repository\TaskRepository;
use App\Repository\UserSkillRepository;
use App\Repository\ProjectUserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Common\Collections\ArrayCollection;
use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\MockObject\MockObject;

class TaskAssignmentServiceTest extends TestCase
{
    private TaskAssignmentService $service;
    private MockObject $entityManager;
    private MockObject $taskRepository;
    private MockObject $userSkillRepository;
    private MockObject $projectUserRepository;

    protected function setUp(): void
    {
        $this->entityManager = $this->createMock(EntityManagerInterface::class);
        $this->taskRepository = $this->createMock(TaskRepository::class);
        $this->userSkillRepository = $this->createMock(UserSkillRepository::class);
        $this->projectUserRepository = $this->createMock(ProjectUserRepository::class);

        $this->service = new TaskAssignmentService(
            $this->entityManager,
            $this->taskRepository,
            $this->userSkillRepository,
            $this->projectUserRepository
        );
    }

    public function testAssignTaskAutomaticallyWithNoProjectUsers(): void
    {
        $task = $this->createMock(Task::class);
        $project = $this->createMock(Project::class);
        
        $task->method('getProject')->willReturn($project);
        $project->method('getId')->willReturn(1);
        
        $this->projectUserRepository
            ->method('findByProject')
            ->with(1)
            ->willReturn([]);

        $result = $this->service->assignTaskAutomatically($task);
        
        $this->assertNull($result);
    }

    public function testAssignTaskAutomaticallyWithAvailableUsers(): void
    {
        $task = $this->createMock(Task::class);
        $project = $this->createMock(Project::class);
        $user = $this->createMock(User::class);
        $projectUser = $this->createMock(ProjectUser::class);
        
        $task->method('getProject')->willReturn($project);
        $task->method('getEstimatedHours')->willReturn(5.0);
        $task->method('getRequiredSkills')->willReturn(new ArrayCollection());
        
        $project->method('getId')->willReturn(1);
        
        $user->method('getMaxWorkloadHours')->willReturn(40.0);
        $user->method('getId')->willReturn(1);
        $user->method('getFirstname')->willReturn('John');
        $user->method('getLastname')->willReturn('Doe');
        
        $projectUser->method('getUser')->willReturn($user);
        
        $this->projectUserRepository
            ->method('findByProject')
            ->with(1)
            ->willReturn([$projectUser]);
            
        $this->taskRepository
            ->method('findBy')
            ->willReturn([]);
            
        $this->userSkillRepository
            ->method('findByUser')
            ->with(1)
            ->willReturn([]);

        $this->entityManager->expects($this->once())->method('flush');
        $task->expects($this->once())->method('setAssignedTo')->with($user);
        $task->expects($this->once())->method('setAssignmentScore')->with($this->isType('float'));

        $result = $this->service->assignTaskAutomatically($task);
        
        $this->assertSame($user, $result);
    }

    public function testAssignTaskAutomaticallyWithOverloadedUsers(): void
    {
        $task = $this->createMock(Task::class);
        $project = $this->createMock(Project::class);
        $user = $this->createMock(User::class);
        $projectUser = $this->createMock(ProjectUser::class);
        $existingTask = $this->createMock(Task::class);
        
        $task->method('getProject')->willReturn($project);
        $task->method('getEstimatedHours')->willReturn(20.0);
        $task->method('getRequiredSkills')->willReturn(new ArrayCollection());
        
        $project->method('getId')->willReturn(1);
        
        $user->method('getMaxWorkloadHours')->willReturn(40.0);
        $user->method('getId')->willReturn(1);
        $user->method('getFirstname')->willReturn('John');
        $user->method('getLastname')->willReturn('Doe');
        
        $projectUser->method('getUser')->willReturn($user);
        
        $existingTask->method('getEstimatedHours')->willReturn(25.0);
        
        $this->projectUserRepository
            ->method('findByProject')
            ->with(1)
            ->willReturn([$projectUser]);
            
        $this->taskRepository
            ->method('findBy')
            ->willReturn([$existingTask]);
            
        $this->userSkillRepository
            ->method('findByUser')
            ->with(1)
            ->willReturn([]);

        $this->entityManager->expects($this->once())->method('flush');
        $task->expects($this->once())->method('setAssignedTo')->with($user);
        $task->expects($this->once())->method('setAssignmentScore')->with($this->isType('float'));

        $result = $this->service->assignTaskAutomatically($task);
        
        $this->assertSame($user, $result);
    }

    public function testAssignAllProjectTasks(): void
    {
        $project = $this->createMock(Project::class);
        
        $project->method('getId')->willReturn(1);
        
        $this->taskRepository
            ->method('findBy')
            ->willReturn([]);
            
        $this->projectUserRepository
            ->method('findByProject')
            ->willReturn([]);

        $result = $this->service->assignAllProjectTasks($project);
        
        $this->assertCount(0, $result); // Aucune assignation car pas de tâches
    }

    public function testGetWorkloadByUser(): void
    {
        $project = $this->createMock(Project::class);
        $user = $this->createMock(User::class);
        $projectUser = $this->createMock(ProjectUser::class);
        $task = $this->createMock(Task::class);
        
        $project->method('getId')->willReturn(1);
        
        $user->method('getId')->willReturn(1);
        $user->method('getFirstname')->willReturn('John');
        $user->method('getLastname')->willReturn('Doe');
        $user->method('getMaxWorkloadHours')->willReturn(40.0);
        
        $projectUser->method('getUser')->willReturn($user);
        
        $task->method('getId')->willReturn(1);
        $task->method('getTitle')->willReturn('Test Task');
        $task->method('getPriority')->willReturn('high');
        $task->method('getStatus')->willReturn('pending');
        $task->method('getEstimatedHours')->willReturn(10.0);
        
        $this->projectUserRepository
            ->method('findByProject')
            ->with(1)
            ->willReturn([$projectUser]);
            
        $this->taskRepository
            ->method('findBy')
            ->willReturn([$task]);

        $result = $this->service->getWorkloadByUser($project);
        
        $this->assertCount(1, $result);
        $this->assertEquals(1, $result[0]['userId']);
        $this->assertEquals('John Doe', $result[0]['userName']);
        $this->assertEquals(1, $result[0]['taskCount']);
        $this->assertEquals(10.0, $result[0]['totalHours']);
        $this->assertEquals(40.0, $result[0]['maxWorkloadHours']);
        $this->assertEquals(25.0, $result[0]['workloadPercentage']);
        $this->assertFalse($result[0]['isOverloaded']);
        $this->assertCount(1, $result[0]['tasks']);
    }

    public function testSkillMatchScoreCalculation(): void
    {
        $task = $this->createMock(Task::class);
        $user = $this->createMock(User::class);
        $skill1 = $this->createMock(Skill::class);
        $skill2 = $this->createMock(Skill::class);
        $userSkill1 = $this->createMock(UserSkill::class);
        $userSkill2 = $this->createMock(UserSkill::class);
        
        $task->method('getRequiredSkills')->willReturn(new ArrayCollection([$skill1, $skill2]));
        
        $skill1->method('getName')->willReturn('PHP');
        $skill2->method('getName')->willReturn('JavaScript');
        
        $user->method('getId')->willReturn(1);
        
        $userSkill1->method('getSkill')->willReturn($skill1);
        $userSkill2->method('getSkill')->willReturn($skill2);
        
        $this->userSkillRepository
            ->method('findByUser')
            ->with(1)
            ->willReturn([$userSkill1, $userSkill2]);

        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('calculateSkillMatchScore');
        $method->setAccessible(true);
        
        $score = $method->invoke($this->service, $task, $user);
        
        $this->assertEquals(1.0, $score); 
    }

    public function testWorkloadScoreCalculation(): void
    {
        $user = $this->createMock(User::class);
        $project = $this->createMock(Project::class);
        $task1 = $this->createMock(Task::class);
        $task2 = $this->createMock(Task::class);
        
        $user->method('getMaxWorkloadHours')->willReturn(40.0);
        
        $task1->method('getEstimatedHours')->willReturn(15.0);
        $task2->method('getEstimatedHours')->willReturn(10.0);
        
        $this->taskRepository
            ->method('findBy')
            ->willReturn([$task1, $task2]);

        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('calculateWorkloadScore');
        $method->setAccessible(true);
        
        $score = $method->invoke($this->service, $user, $project);
        
        $this->assertEquals(0.6, $score);
    }

    public function testPriorityBonusCalculation(): void
    {
        $taskHigh = $this->createMock(Task::class);
        $taskMedium = $this->createMock(Task::class);
        $taskLow = $this->createMock(Task::class);
        
        $taskHigh->method('getPriority')->willReturn('high');
        $taskMedium->method('getPriority')->willReturn('medium');
        $taskLow->method('getPriority')->willReturn('low');

        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('calculatePriorityBonus');
        $method->setAccessible(true);
        
        $this->assertEquals(1.0, $method->invoke($this->service, $taskHigh));
        $this->assertEquals(0.7, $method->invoke($this->service, $taskMedium));
        $this->assertEquals(0.4, $method->invoke($this->service, $taskLow));
    }

    public function testAssignmentScoreCalculation(): void
    {
        $task = $this->createMock(Task::class);
        $user = $this->createMock(User::class);
        $project = $this->createMock(Project::class);
        
        $task->method('getRequiredSkills')->willReturn(new ArrayCollection());
        $task->method('getProject')->willReturn($project);
        
        $user->method('getId')->willReturn(1);
        $user->method('getMaxWorkloadHours')->willReturn(40.0);
        
        $this->userSkillRepository
            ->method('findByUser')
            ->willReturn([]);
            
        $this->taskRepository
            ->method('findBy')
            ->willReturn([]);

        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('calculateAssignmentScore');
        $method->setAccessible(true);
        
        $score = $method->invoke($this->service, $task, $user);
        
        $this->assertIsFloat($score);
        $this->assertGreaterThanOrEqual(0, $score);
        $this->assertLessThanOrEqual(1, $score);
    }
}
