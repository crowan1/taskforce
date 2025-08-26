<?php

namespace App\Controller;

use App\Entity\Project;
use App\Entity\User;
use App\Repository\ProjectRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/projects')]
class ProjectController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private ProjectRepository $projectRepository
    ) {}

    #[Route('', name: 'get_projects', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getProjects(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $projects = $this->projectRepository->findByUser($user->getId());
        
        $formattedProjects = array_map(function(Project $project) {
            return [
                'id' => $project->getId(),
                'name' => $project->getName(),
                'description' => $project->getDescription(),
                'status' => $project->getStatus(),
                'createdAt' => $project->getCreatedAt()->format('Y-m-d H:i:s'),
                'updatedAt' => $project->getUpdatedAt()->format('Y-m-d H:i:s'),
                'createdBy' => [
                    'id' => $project->getCreatedBy()->getId(),
                    'firstname' => $project->getCreatedBy()->getFirstname(),
                    'lastname' => $project->getCreatedBy()->getLastname(),
                    'email' => $project->getCreatedBy()->getEmail()
                ],
                'taskCount' => $project->getTasks()->count(),
                'users' => array_map(function($user) {
                    return [
                        'id' => $user->getId(),
                        'firstname' => $user->getFirstname(),
                        'lastname' => $user->getLastname(),
                        'email' => $user->getEmail()
                    ];
                }, $project->getUsers()->toArray())
            ];
        }, $projects);

        return $this->json([
            'success' => true,
            'projects' => $formattedProjects
        ]);
    }

    #[Route('', name: 'create_project', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function createProject(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $data = json_decode($request->getContent(), true);
        
        if (!$data) {
            return $this->json([
                'success' => false,
                'message' => 'Données invalidess'
            ], 400);
        }

        if (empty($data['name'])) {
            return $this->json([
                'success' => false,
                'message' => 'Le nom du projet est requis'
            ], 400);
        }

        $project = new Project();
        $project->setName($data['name']);
        $project->setDescription($data['description'] ?? null);
        $project->setStatus($data['status'] ?? 'active');
        $project->setCreatedBy($user);

        $this->entityManager->persist($project);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'message' => 'Projet créé avec succès',
            'project' => [
                'id' => $project->getId(),
                'name' => $project->getName(),
                'description' => $project->getDescription(),
                'status' => $project->getStatus(),
                'createdAt' => $project->getCreatedAt()->format('Y-m-d H:i:s'),
                'updatedAt' => $project->getUpdatedAt()->format('Y-m-d H:i:s'),
                'createdBy' => [
                    'id' => $project->getCreatedBy()->getId(),
                    'firstname' => $project->getCreatedBy()->getFirstname(),
                    'lastname' => $project->getCreatedBy()->getLastname(),
                    'email' => $project->getCreatedBy()->getEmail()
                ],
                'taskCount' => 0
            ]
        ], 201);
    }

    #[Route('/{id}/add-user', name: 'add_user_to_project', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function addUserToProject(int $id, Request $request): JsonResponse
    {
        $project = $this->projectRepository->find($id);
        
        if (!$project) {
            return $this->json(['error' => 'Projet non trouvé'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? null;

        if (!$email) {
            return $this->json(['error' => 'Email requis'], 400);
        }

        $userRepository = $this->entityManager->getRepository(User::class);
        $user = $userRepository->findOneBy(['email' => $email]);

        if (!$user) {
            return $this->json(['error' => 'Utilisateur non trouvé'], 404);
        }

        // Vérifier si l'utilisateur est déjà dans le projet
        if ($project->getUsers()->contains($user)) {
            return $this->json(['error' => 'Utilisateur déjà dans le projet'], 400);
        }

        $project->addUser($user);
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Utilisateur ajouté au projet',
            'user' => [
                'id' => $user->getId(),
                'firstname' => $user->getFirstname(),
                'lastname' => $user->getLastname(),
                'email' => $user->getEmail()
            ]
        ]);
    }
}
