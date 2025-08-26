<?php

namespace App\Controller;

use App\Entity\Task;
use App\Entity\User;
use App\Entity\Project;
use App\Entity\Skill;
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
                'level' => $task->getLevel(),
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
                        'category' => null,
                        'level' => $skill->getLevel()
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
        $task->setLevel($data['level'] ?? 'intermediate');
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
                'level' => $task->getLevel(),
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
                        'category' => null,
                        'level' => $skill->getLevel()
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

        if ($task->getCreatedBy()->getId() !== $user->getId()) {
            return $this->json([
                'success' => false,
                'message' => 'Seul le créateur peut modifier la tâche'
            ], 403);
        }

        $data = json_decode($request->getContent(), true);
        
        if (!$data) {
            return $this->json([
                'success' => false,
                'message' => 'Données invalides'
            ], 400);
        }

        if (isset($data['title'])) {
            $task->setTitle($data['title']);
        }
        if (isset($data['description'])) {
            $task->setDescription($data['description']);
        }
        if (isset($data['priority'])) {
            $task->setPriority($data['priority']);
        }
        if (isset($data['status'])) {
            $task->setStatus($data['status']);
        }

        // Mettre à jour les compétences si fournies
        if (isset($data['skillIds'])) {
            $task->getRequiredSkills()->clear();
            $skillRepository = $this->entityManager->getRepository(Skill::class);
            
            foreach ($data['skillIds'] as $skillId) {
                $skill = $skillRepository->find($skillId);
                if ($skill) {
                    $task->addRequiredSkill($skill);
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
                        'category' => null,
                        'level' => $skill->getLevel()
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

    #[Route('/{id}/add-skills', name: 'add_skills_to_task', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function addSkillsToTask(int $id, Request $request): JsonResponse
    {
        $task = $this->taskRepository->find($id);
        
        if (!$task) {
            return $this->json(['error' => 'Tâche non trouvée'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $skillIds = $data['skillIds'] ?? [];

        if (empty($skillIds)) {
            return $this->json(['error' => 'Aucune compétence sélectionnée'], 400);
        }

        $skillRepository = $this->entityManager->getRepository(Skill::class);
        
        foreach ($skillIds as $skillId) {
            $skill = $skillRepository->find($skillId);
            if ($skill) {
                $task->addRequiredSkill($skill);
            }
        }

        $this->entityManager->flush();

        return $this->json([
            'message' => 'Compétences ajoutées à la tâche',
            'taskId' => $task->getId(),
            'skillIds' => $skillIds
        ]);
    }
}
