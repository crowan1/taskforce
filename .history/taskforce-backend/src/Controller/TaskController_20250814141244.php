<?php

namespace App\Controller;

use App\Entity\Task;
use App\Entity\User;
use App\Entity\Project;
use App\Repository\TaskRepository;
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
        private TaskRepository $taskRepository
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
                ]
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
                ]
            ]
        ], 201);
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

        if ($task->getCreatedBy()->getId() !== $user->getId()) {
            return $this->json([
                'success' => false,
                'message' => 'Seul le créateur peut supprimer la tâche'
            ], 403);
        }

        $this->entityManager->remove($task);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'message' => 'Tâche supprimée avec succès'
        ]);
    }
}
