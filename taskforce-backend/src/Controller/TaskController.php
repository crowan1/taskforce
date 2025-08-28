<?php

namespace App\Controller;

use App\Entity\Task;
use App\Entity\User;
use App\Entity\Project;
use App\Entity\Skill;
use App\Repository\TaskRepository;
use App\Repository\ProjectRepository;
use App\Service\TaskAssignmentService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/tasks')]
class TaskController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private TaskRepository $taskRepository,
        private ProjectRepository $projectRepository,
        private TaskAssignmentService $taskAssignmentService
    ) {}

    #[Route('', name: 'get_tasks', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getTasks(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $projectId = $request->query->get('projectId');
        
        if ($projectId) {
            $tasks = $this->taskRepository->findByUserAndProject($user->getId(), $projectId);
        } else {
            $tasks = $this->taskRepository->findByUser($user->getId());
        }
        
        $formattedTasks = array_map(function(Task $task) {
            return [
                'id' => $task->getId(),
                'title' => $task->getTitle(),
                'description' => $task->getDescription(),
                'status' => $task->getStatus(),
                'priority' => $task->getPriority(),
                'createdAt' => $task->getCreatedAt()->format('Y-m-d H:i:s'),
                'updatedAt' => $task->getUpdatedAt()->format('Y-m-d H:i:s'),
                'project' => [
                    'id' => $task->getProject()->getId(),
                    'name' => $task->getProject()->getName()
                ],
                'assignedTo' => $task->getAssignedTo() ? [
                    'id' => $task->getAssignedTo()->getId(),
                    'firstname' => $task->getAssignedTo()->getFirstname(),
                    'lastname' => $task->getAssignedTo()->getLastname(),
                    'email' => $task->getAssignedTo()->getEmail()
                ] : null,
                'createdBy' => [
                    'id' => $task->getCreatedBy()->getId(),
                    'firstname' => $task->getCreatedBy()->getFirstname(),
                    'lastname' => $task->getCreatedBy()->getLastname(),
                    'email' => $task->getCreatedBy()->getEmail()
                ],
                'requiredSkills' => array_map(function($skill) {
                    return [
                        'id' => $skill->getId(),
                        'name' => $skill->getName(),
                        'category' => null
                    ];
                }, $task->getRequiredSkills()->toArray())
            ];
        }, $tasks);

        return $this->json([
            'success' => true,
            'tasks' => $formattedTasks
        ]);
    }

    #[Route('', name: 'create_task', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function createTask(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $data = json_decode($request->getContent(), true);
        
        if (!$data) {
            return $this->json([
                'success' => false,
                'message' => 'Données invalides'
            ], 400);
        }

        if (empty($data['title'])) {
            return $this->json([
                'success' => false,
                'message' => 'Le titre est requis'
            ], 400);
        }

        if (empty($data['projectId'])) {
            return $this->json([
                'success' => false,
                'message' => 'L\'ID du projet est requis'
            ], 400);
        }

        $project = $this->entityManager->getRepository(Project::class)->find($data['projectId']);
        if (!$project) {
            return $this->json([
                'success' => false,
                'message' => 'Projet non trouvé'
            ], 404);
        }

        $task = new Task();
        $task->setTitle($data['title']);
        $task->setDescription($data['description'] ?? null);
        $task->setStatus($data['status'] ?? 'todo');
        $task->setPriority($data['priority'] ?? 'medium');
        $task->setCreatedBy($user);
        $task->setProject($project);

        if (!empty($data['assignedTo'])) {
            $assignedUser = $this->entityManager->getRepository(User::class)->find($data['assignedTo']);
            if ($assignedUser) {
                $task->setAssignedTo($assignedUser);
            }
        }

        // Ajouter les compétences requises à la tâche
        if (!empty($data['skillIds'])) {
            $skillRepository = $this->entityManager->getRepository(Skill::class);
            foreach ($data['skillIds'] as $skillId) {
                $skill = $skillRepository->find($skillId);
                if ($skill) {
                    $task->addRequiredSkill($skill);
                }
            }
        }

        $this->entityManager->persist($task);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'message' => 'Tâche créée avec succès',
            'task' => [
                'id' => $task->getId(),
                'title' => $task->getTitle(),
                'description' => $task->getDescription(),
                'status' => $task->getStatus(),
                'priority' => $task->getPriority(),
                'createdAt' => $task->getCreatedAt()->format('Y-m-d H:i:s'),
                'project' => [
                    'id' => $task->getProject()->getId(),
                    'name' => $task->getProject()->getName()
                ],
                'assignedTo' => $task->getAssignedTo() ? [
                    'id' => $task->getAssignedTo()->getId(),
                    'firstname' => $task->getAssignedTo()->getFirstname(),
                    'lastname' => $task->getAssignedTo()->getLastname(),
                    'email' => $task->getAssignedTo()->getEmail()
                ] : null,
                'createdBy' => [
                    'id' => $task->getCreatedBy()->getId(),
                    'firstname' => $task->getCreatedBy()->getFirstname(),
                    'lastname' => $task->getCreatedBy()->getLastname(),
                    'email' => $task->getCreatedBy()->getEmail()
                ],
                'requiredSkills' => array_map(function($skill) {
                    return [
                        'id' => $skill->getId(),
                        'name' => $skill->getName(),
                        'category' => null
                    ];
                }, $task->getRequiredSkills()->toArray())
            ]
        ]);
    }

    #[Route('/{id}', name: 'update_task', methods: ['PUT'])]
    #[IsGranted('ROLE_USER')]
    public function updateTask(int $id, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $task = $this->taskRepository->find($id);
        if (!$task) {
            return $this->json([
                'success' => false,
                'message' => 'Tâche non trouvée'
            ], 404);
        }

        // Vérifier que l'utilisateur a accès à cette tâche
        $projectUser = $this->entityManager->getRepository('App\Entity\ProjectUser')
            ->findOneBy(['project' => $task->getProject(), 'user' => $user]);
        
        if (!$projectUser) {
            return $this->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        $data = json_decode($request->getContent(), true);
        
        if (isset($data['title'])) {
            $task->setTitle($data['title']);
        }
        
        if (isset($data['description'])) {
            $task->setDescription($data['description']);
        }
        
        if (isset($data['status'])) {
            $task->setStatus($data['status']);
        }
        
        if (isset($data['priority'])) {
            $task->setPriority($data['priority']);
        }

        if (isset($data['assignedTo'])) {
            if ($data['assignedTo']) {
                $assignedUser = $this->entityManager->getRepository(User::class)->find($data['assignedTo']);
                if ($assignedUser) {
                    $task->setAssignedTo($assignedUser);
                }
            } else {
                $task->setAssignedTo(null);
            }
        }

        // Mettre à jour les compétences requises
        if (isset($data['skillIds'])) {
            $task->getRequiredSkills()->clear();
            if (!empty($data['skillIds'])) {
                $skillRepository = $this->entityManager->getRepository(Skill::class);
                foreach ($data['skillIds'] as $skillId) {
                    $skill = $skillRepository->find($skillId);
                    if ($skill) {
                        $task->addRequiredSkill($skill);
                    }
                }
            }
        }

        $task->setUpdatedAt(new \DateTimeImmutable());
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'message' => 'Tâche mise à jour avec succès',
            'task' => [
                'id' => $task->getId(),
                'title' => $task->getTitle(),
                'description' => $task->getDescription(),
                'status' => $task->getStatus(),
                'priority' => $task->getPriority(),
                'createdAt' => $task->getCreatedAt()->format('Y-m-d H:i:s'),
                'updatedAt' => $task->getUpdatedAt()->format('Y-m-d H:i:s'),
                'project' => [
                    'id' => $task->getProject()->getId(),
                    'name' => $task->getProject()->getName()
                ],
                'assignedTo' => $task->getAssignedTo() ? [
                    'id' => $task->getAssignedTo()->getId(),
                    'firstname' => $task->getAssignedTo()->getFirstname(),
                    'lastname' => $task->getAssignedTo()->getLastname(),
                    'email' => $task->getAssignedTo()->getEmail()
                ] : null,
                'createdBy' => [
                    'id' => $task->getCreatedBy()->getId(),
                    'firstname' => $task->getCreatedBy()->getFirstname(),
                    'lastname' => $task->getCreatedBy()->getLastname(),
                    'email' => $task->getCreatedBy()->getEmail()
                ],
                'requiredSkills' => array_map(function($skill) {
                    return [
                        'id' => $skill->getId(),
                        'name' => $skill->getName(),
                        'category' => null
                    ];
                }, $task->getRequiredSkills()->toArray())
            ]
        ]);
    }

    #[Route('/{id}', name: 'delete_task', methods: ['DELETE'])]
    #[IsGranted('ROLE_USER')]
    public function deleteTask(int $id): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $task = $this->taskRepository->find($id);
        if (!$task) {
            return $this->json([
                'success' => false,
                'message' => 'Tâche non trouvée'
            ], 404);
        }

        // Vérifier que l'utilisateur a accès à cette tâche
        $projectUser = $this->entityManager->getRepository('App\Entity\ProjectUser')
            ->findOneBy(['project' => $task->getProject(), 'user' => $user]);
        
        if (!$projectUser) {
            return $this->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        $this->entityManager->remove($task);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'message' => 'Tâche supprimée avec succès'
        ]);
    }

    #[Route('/{id}/assign', name: 'assign_task_automatically', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function assignTaskAutomatically(int $id): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $task = $this->taskRepository->find($id);
        if (!$task) {
            return $this->json([
                'success' => false,
                'message' => 'Tâche non trouvée'
            ], 404);
        }

        // Vérifier que l'utilisateur a accès à cette tâche
        $projectUser = $this->entityManager->getRepository('App\Entity\ProjectUser')
            ->findOneBy(['project' => $task->getProject(), 'user' => $user]);
        
        if (!$projectUser) {
            return $this->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        try {
            $assignedUser = $this->taskAssignmentService->assignTaskAutomatically($task);
            
            if ($assignedUser) {
                return $this->json([
                    'success' => true,
                    'message' => 'Tâche assignée automatiquement',
                    'assignedTo' => [
                        'id' => $assignedUser->getId(),
                        'firstname' => $assignedUser->getFirstname(),
                        'lastname' => $assignedUser->getLastname(),
                        'email' => $assignedUser->getEmail()
                    ]
                ]);
            } else {
                return $this->json([
                    'success' => false,
                    'message' => 'Aucun utilisateur disponible pour cette tâche'
                ]);
            }
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de l\'assignation automatique: ' . $e->getMessage()
            ], 500);
        }
    }

    #[Route('/project/{projectId}/assign-all', name: 'assign_all_project_tasks', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function assignAllProjectTasks(int $projectId): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $project = $this->projectRepository->find($projectId);
        if (!$project) {
            return $this->json([
                'success' => false,
                'message' => 'Projet non trouvé'
            ], 404);
        }

        // Vérifier que l'utilisateur a accès à ce projet
        $projectUser = $this->entityManager->getRepository('App\Entity\ProjectUser')
            ->findOneBy(['project' => $project, 'user' => $user]);
        
        if (!$projectUser) {
            return $this->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        try {
            $results = $this->taskAssignmentService->assignAllProjectTasks($project);
            
            return $this->json([
                'success' => true,
                'message' => 'Assignation automatique terminée',
                'results' => $results
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de l\'assignation automatique: ' . $e->getMessage()
            ], 500);
        }
    }

    #[Route('/project/{projectId}/workload', name: 'get_project_workload', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getProjectWorkload(int $projectId): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $project = $this->projectRepository->find($projectId);
        if (!$project) {
            return $this->json([
                'success' => false,
                'message' => 'Projet non trouvé'
            ], 404);
        }

        // Vérifier que l'utilisateur a accès à ce projet
        $projectUser = $this->entityManager->getRepository('App\Entity\ProjectUser')
            ->findOneBy(['project' => $project, 'user' => $user]);
        
        if (!$projectUser) {
            return $this->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        try {
            $workload = $this->taskAssignmentService->getWorkloadByUser($project);
            
            return $this->json([
                'success' => true,
                'workload' => $workload
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Erreur lors du calcul de la charge de travail: ' . $e->getMessage()
            ], 500);
        }
    }
}
