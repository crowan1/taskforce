<?php

namespace App\Controller;

use App\Entity\Task;
use App\Entity\User;
use App\Repository\TaskRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/task-assignment')]
class TaskAssignmentController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private TaskRepository $taskRepository,
        private UserRepository $userRepository
    ) {}

    #[Route('/auto-assign/{taskId}', name: 'auto_assign_task', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function autoAssignTask(int $taskId): JsonResponse
    {
        $task = $this->taskRepository->find($taskId);
        if (!$task) {
            return $this->json([
                'success' => false,
                'message' => 'Tâche non trouvée'
            ], 404);
        }

        $bestUser = $this->findBestUserForTask($task);
        
        if (!$bestUser) {
            return $this->json([
                'success' => false,
                'message' => 'Aucun utilisateur disponible avec les compétences requises'
            ], 404);
        }

        $task->setAssignedTo($bestUser);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'message' => 'Tâche assignée automatiquement',
            'assignedTo' => [
                'id' => $bestUser->getId(),
                'firstname' => $bestUser->getFirstname(),
                'lastname' => $bestUser->getLastname(),
                'email' => $bestUser->getEmail()
            ]
        ]);
    }

    #[Route('/auto-assign-all', name: 'auto_assign_all_tasks', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function autoAssignAllTasks(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $projectId = $data['projectId'] ?? null;

        if (!$projectId) {
            return $this->json([
                'success' => false,
                'message' => 'ID du projet requis'
            ], 400);
        }

        $unassignedTasks = $this->taskRepository->createQueryBuilder('t')
            ->where('t.project = :projectId')
            ->andWhere('t.assignedTo IS NULL')
            ->setParameter('projectId', $projectId)
            ->getQuery()
            ->getResult();

        $assignments = [];
        $errors = [];

        foreach ($unassignedTasks as $task) {
            $bestUser = $this->findBestUserForTask($task);
            
            if ($bestUser) {
                $task->setAssignedTo($bestUser);
                $assignments[] = [
                    'taskId' => $task->getId(),
                    'taskTitle' => $task->getTitle(),
                    'assignedTo' => [
                        'id' => $bestUser->getId(),
                        'firstname' => $bestUser->getFirstname(),
                        'lastname' => $bestUser->getLastname()
                    ]
                ];
            } else {
                $errors[] = [
                    'taskId' => $task->getId(),
                    'taskTitle' => $task->getTitle(),
                    'message' => 'Aucun utilisateur disponible avec les compétences requises'
                ];
            }
        }

        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'message' => 'Assignation automatique terminée',
            'assignments' => $assignments,
            'errors' => $errors,
            'totalAssigned' => count($assignments),
            'totalErrors' => count($errors)
        ]);
    }

    #[Route('/workload-analysis', name: 'workload_analysis', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function workloadAnalysis(Request $request): JsonResponse
    {
        $projectId = $request->query->get('projectId');
        
        if (!$projectId) {
            return $this->json([
                'success' => false,
                'message' => 'ID du projet requis'
            ], 400);
        }

        $users = $this->userRepository->findAll();
        $workloadData = [];

        foreach ($users as $user) {
            $taskCount = $this->taskRepository->createQueryBuilder('t')
                ->select('COUNT(t.id)')
                ->where('t.assignedTo = :userId')
                ->andWhere('t.project = :projectId')
                ->andWhere('t.status != :doneStatus')
                ->setParameter('userId', $user->getId())
                ->setParameter('projectId', $projectId)
                ->setParameter('doneStatus', 'done')
                ->getQuery()
                ->getSingleScalarResult();

            $workloadData[] = [
                'userId' => $user->getId(),
                'firstname' => $user->getFirstname(),
                'lastname' => $user->getLastname(),
                'email' => $user->getEmail(),
                'taskCount' => $taskCount,
                'skills' => array_map(function($skill) {
                    return [
                        'id' => $skill->getId(),
                        'name' => $skill->getName(),
                        'category' => $skill->getCategory(),
                        'level' => $skill->getLevel()
                    ];
                }, $user->getSkills()->toArray())
            ];
        }

        return $this->json([
            'success' => true,
            'workloadData' => $workloadData
        ]);
    }

    private function findBestUserForTask(Task $task): ?User
    {
        $requiredSkills = $task->getRequiredSkills();
        
        if ($requiredSkills->isEmpty()) {
            // Si aucune compétence requise, assigner à l'utilisateur avec le moins de tâches
            return $this->findUserWithLeastWorkload($task->getProject()->getId());
        }

        $users = $this->userRepository->findAll();
        $bestUser = null;
        $bestScore = -1;

        foreach ($users as $user) {
            $score = $this->calculateUserTaskScore($user, $requiredSkills, $task->getProject()->getId());
            
            if ($score > $bestScore) {
                $bestScore = $score;
                $bestUser = $user;
            }
        }

        return $bestUser;
    }

    private function calculateUserTaskScore(User $user, $requiredSkills, int $projectId): float
    {
        $userSkills = $user->getSkills();
        $skillMatchCount = 0;
        $totalSkillLevel = 0;

        foreach ($requiredSkills as $requiredSkill) {
            foreach ($userSkills as $userSkill) {
                if ($userSkill->getId() === $requiredSkill->getId()) {
                    $skillMatchCount++;
                    $totalSkillLevel += $userSkill->getLevel();
                    break;
                }
            }
        }

        if ($skillMatchCount === 0) {
            return 0;
        }

        // Calculer la charge de travail actuelle
        $currentTaskCount = $this->taskRepository->createQueryBuilder('t')
            ->select('COUNT(t.id)')
            ->where('t.assignedTo = :userId')
            ->andWhere('t.project = :projectId')
            ->andWhere('t.status != :doneStatus')
            ->setParameter('userId', $user->getId())
            ->setParameter('projectId', $projectId)
            ->setParameter('doneStatus', 'done')
            ->getQuery()
            ->getSingleScalarResult();

        // Score basé sur la correspondance des compétences et la charge de travail
        $skillScore = ($skillMatchCount / $requiredSkills->count()) * 100;
        $levelScore = $totalSkillLevel / $skillMatchCount;
        $workloadPenalty = $currentTaskCount * 10; // Pénalité pour la charge de travail

        return $skillScore + $levelScore - $workloadPenalty;
    }

    private function findUserWithLeastWorkload(int $projectId): ?User
    {
        $users = $this->userRepository->findAll();
        $bestUser = null;
        $minTaskCount = PHP_INT_MAX;

        foreach ($users as $user) {
            $taskCount = $this->taskRepository->createQueryBuilder('t')
                ->select('COUNT(t.id)')
                ->where('t.assignedTo = :userId')
                ->andWhere('t.project = :projectId')
                ->andWhere('t.status != :doneStatus')
                ->setParameter('userId', $user->getId())
                ->setParameter('projectId', $projectId)
                ->setParameter('doneStatus', 'done')
                ->getQuery()
                ->getSingleScalarResult();

            if ($taskCount < $minTaskCount) {
                $minTaskCount = $taskCount;
                $bestUser = $user;
            }
        }

        return $bestUser;
    }
}
