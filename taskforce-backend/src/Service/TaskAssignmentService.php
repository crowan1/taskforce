<?php

namespace App\Service;

use App\Entity\Task;
use App\Entity\User;
use App\Entity\Project;
use App\Repository\TaskRepository;
use App\Repository\UserSkillRepository;
use App\Repository\ProjectUserRepository;
use Doctrine\ORM\EntityManagerInterface;

class TaskAssignmentService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private TaskRepository $taskRepository,
        private UserSkillRepository $userSkillRepository,
        private ProjectUserRepository $projectUserRepository
    ) {}

    public function assignTaskAutomatically(Task $task): ?User
    {
        $project = $task->getProject();
        $projectUsers = $this->projectUserRepository->findByProject($project->getId());
        
        if (empty($projectUsers)) {
            return null;
        }

        $bestUser = null;
        $bestScore = 0;
        $taskHours = $task->getEstimatedHours() ?? 1.0;

        $availableUsers = [];
        foreach ($projectUsers as $projectUser) {
            $user = $projectUser->getUser();
            $currentWorkload = $this->getCurrentWorkloadHours($user, $project);
            $maxWorkload = $user->getMaxWorkloadHours() ?? 40.0;
            
            if (($currentWorkload + $taskHours) <= $maxWorkload) {
                $availableUsers[] = $user;
            }
        }

        if (empty($availableUsers)) {
            $availableUsers = array_map(fn($pu) => $pu->getUser(), $projectUsers);
        }

        foreach ($availableUsers as $user) {
            $score = $this->calculateAssignmentScore($task, $user);
            
            if ($score > $bestScore) {
                $bestScore = $score;
                $bestUser = $user;
            }
        }

        if ($bestUser && $bestScore > 0) {
            $task->setAssignedTo($bestUser);
            $task->setAssignmentScore($bestScore);
            $this->entityManager->flush();
        }

        return $bestUser;
    }

    public function assignAllProjectTasks(Project $project): array
    {
        $unassignedTasks = $this->taskRepository->findBy([
            'project' => $project,
            'assignedTo' => null
        ]);

        $assignments = [];
        foreach ($unassignedTasks as $task) {
            $assignedUser = $this->assignTaskAutomatically($task);
            if ($assignedUser) {
                $assignments[] = [
                    'taskId' => $task->getId(),
                    'taskTitle' => $task->getTitle(),
                    'userId' => $assignedUser->getId(),
                    'userName' => $assignedUser->getFirstname() . ' ' . $assignedUser->getLastname(),
                    'score' => $task->getAssignmentScore()
                ];
            }
        }

        return $assignments;
    }

    private function calculateAssignmentScore(Task $task, User $user): float
    {
        $skillScore = $this->calculateSkillMatchScore($task, $user);
        $workloadScore = $this->calculateWorkloadScore($user, $task->getProject());

        $totalScore = ($skillScore * 0.6) + ($workloadScore * 0.4);
        
        return round($totalScore, 2);
    }

    private function calculateSkillMatchScore(Task $task, User $user): float
    {
        $requiredSkills = $task->getRequiredSkills();
        if ($requiredSkills->isEmpty()) {
            return 0.5;
        }

        $userSkills = $this->userSkillRepository->findByUser($user->getId());
        $userSkillMap = [];
        
        foreach ($userSkills as $userSkill) {
            $userSkillMap[$userSkill->getSkill()->getName()] = true;
        }

        $totalScore = 0;
        $skillCount = 0;

        foreach ($requiredSkills as $requiredSkill) {
            $skillName = $requiredSkill->getName();
            $hasSkill = $userSkillMap[$skillName] ?? false;
            
            if ($hasSkill) {
                $totalScore += 1.0;
            }
            $skillCount++;
        }

        return $skillCount > 0 ? $totalScore / $skillCount : 0;
    }

    private function calculateWorkloadScore(User $user, Project $project): float
    {
        $assignedTasks = $this->taskRepository->findBy([
            'assignedTo' => $user,
            'project' => $project
        ]);

        $totalHours = 0;
        foreach ($assignedTasks as $task) {
            $totalHours += $task->getEstimatedHours() ?? 1.0;
        }

        $maxWorkload = $user->getMaxWorkloadHours() ?? 40.0;
        $workloadPercentage = $totalHours / $maxWorkload;
        
        if ($workloadPercentage >= 1.0) {
            return 0.0;
        } elseif ($workloadPercentage >= 0.9) {
            return 0.1;
        } elseif ($workloadPercentage >= 0.75) {
            return 0.3;
        } elseif ($workloadPercentage >= 0.5) {
            return 0.6;
        } else {
            return 1.0;
        }
    }

    private function calculatePriorityBonus(Task $task): float
    {
        $priority = $task->getPriority();
        
        switch ($priority) {
            case 'high':
                return 1.0;
            case 'medium':
                return 0.7;
            case 'low':
                return 0.4;
            default:
                return 0.7;
        }
    }



    public function getWorkloadByUser(Project $project): array
    {
        $projectUsers = $this->projectUserRepository->findByProject($project->getId());
        $workloads = [];

        foreach ($projectUsers as $projectUser) {
            $user = $projectUser->getUser();
            $assignedTasks = $this->taskRepository->findBy([
                'assignedTo' => $user,
                'project' => $project
            ]);

            $totalHours = 0;
            foreach ($assignedTasks as $task) {
                $totalHours += $task->getEstimatedHours() ?? 1.0;
            }

            $maxWorkload = $user->getMaxWorkloadHours() ?? 40.0;
            $workloadPercentage = $maxWorkload > 0 ? ($totalHours / $maxWorkload) * 100 : 0;

            $workloads[] = [
                'userId' => $user->getId(),
                'userName' => $user->getFirstname() . ' ' . $user->getLastname(),
                'taskCount' => count($assignedTasks),
                'totalHours' => $totalHours,
                'maxWorkloadHours' => $maxWorkload,
                'workloadPercentage' => round($workloadPercentage, 1),
                'isOverloaded' => $totalHours > $maxWorkload,
                'tasks' => array_map(function($task) {
                    return [
                        'id' => $task->getId(),
                        'title' => $task->getTitle(),
                        'priority' => $task->getPriority(),
                        'status' => $task->getStatus(),
                        'estimatedHours' => $task->getEstimatedHours()
                    ];
                }, $assignedTasks)
            ];
        }

        return $workloads;
    }

    private function getCurrentWorkloadHours(User $user, Project $project): float
    {
        $assignedTasks = $this->taskRepository->findBy([
            'assignedTo' => $user,
            'project' => $project
        ]);

        $totalHours = 0;
        foreach ($assignedTasks as $task) {
            $totalHours += $task->getEstimatedHours() ?? 1.0;
        }

        return $totalHours;
    }
}
