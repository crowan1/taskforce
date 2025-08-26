<?php

namespace App\Controller;

use App\Entity\Project;
use App\Entity\User;
use App\Entity\ProjectUser;
use App\Repository\ProjectRepository;
use App\Repository\ProjectUserRepository;
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
        private ProjectRepository $projectRepository,
        private ProjectUserRepository $projectUserRepository
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
                'users' => array_map(function($projectUser) {
                    return [
                        'id' => $projectUser->getUser()->getId(),
                        'firstname' => $projectUser->getUser()->getFirstname(),
                        'lastname' => $projectUser->getUser()->getLastname(),
                        'email' => $projectUser->getUser()->getEmail(),
                        'role' => $projectUser->getRole(),
                        'joinedAt' => $projectUser->getJoinedAt()->format('Y-m-d H:i:s')
                    ];
                }, $project->getProjectUsers()->toArray()),
                'taskCount' => $project->getTasks()->count()
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

        // Ajouter le créateur comme admin du projet
        $projectUser = new ProjectUser();
        $projectUser->setProject($project);
        $projectUser->setUser($user);
        $projectUser->setRole('admin');

        $this->entityManager->persist($project);
        $this->entityManager->persist($projectUser);
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
        /** @var User $currentUser */
        $currentUser = $this->getUser();
        
        $project = $this->projectRepository->find($id);
        
        if (!$project) {
            return $this->json(['error' => 'Projet non trouvé'], 404);
        }

        // Vérifier si l'utilisateur actuel est admin du projet
        $currentUserProject = $this->projectUserRepository->findByUserAndProject($currentUser->getId(), $id);
        if (!$currentUserProject || !$currentUserProject->isAdmin()) {
            return $this->json(['error' => 'Seuls les administrateurs peuvent ajouter des utilisateurs'], 403);
        }

        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? null;
        $role = $data['role'] ?? 'member';

        if (!$email) {
            return $this->json(['error' => 'Email requis'], 400);
        }

        if (!in_array($role, ['admin', 'member'])) {
            return $this->json(['error' => 'Rôle invalide'], 400);
        }

        $userRepository = $this->entityManager->getRepository(User::class);
        $user = $userRepository->findOneBy(['email' => $email]);

        if (!$user) {
            return $this->json(['error' => 'Aucun utilisateur trouvé avec cet email: ' . $email], 404);
        }

        // Vérifier si l'utilisateur est déjà dans le projet
        $existingProjectUser = $this->projectUserRepository->findByUserAndProject($user->getId(), $id);
        if ($existingProjectUser) {
            return $this->json(['error' => 'L\'utilisateur ' . $user->getFirstname() . ' ' . $user->getLastname() . ' est déjà dans ce projet'], 400);
        }

        $projectUser = new ProjectUser();
        $projectUser->setProject($project);
        $projectUser->setUser($user);
        $projectUser->setRole($role);

        $this->entityManager->persist($projectUser);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'message' => 'Utilisateur ajouté au projet avec succès',
            'user' => [
                'id' => $user->getId(),
                'firstname' => $user->getFirstname(),
                'lastname' => $user->getLastname(),
                'email' => $user->getEmail(),
                'role' => $role
            ]
        ]);
    }

    #[Route('/{id}/update-user-role', name: 'update_user_role', methods: ['PUT'])]
    #[IsGranted('ROLE_USER')]
    public function updateUserRole(int $id, Request $request): JsonResponse
    {
        /** @var User $currentUser */
        $currentUser = $this->getUser();
        
        $project = $this->projectRepository->find($id);
        
        if (!$project) {
            return $this->json(['error' => 'Projet non trouvé'], 404);
        }

        // Vérifier si l'utilisateur actuel est admin du projet
        $currentUserProject = $this->projectUserRepository->findByUserAndProject($currentUser->getId(), $id);
        if (!$currentUserProject || !$currentUserProject->isAdmin()) {
            return $this->json(['error' => 'Seuls les administrateurs peuvent modifier les rôles'], 403);
        }

        $data = json_decode($request->getContent(), true);
        $userId = $data['userId'] ?? null;
        $role = $data['role'] ?? null;

        if (!$userId || !$role) {
            return $this->json(['error' => 'userId et role requis'], 400);
        }

        if (!in_array($role, ['admin', 'member'])) {
            return $this->json(['error' => 'Rôle invalide'], 400);
        }

        // Empêcher de retirer le dernier admin
        if ($role === 'member') {
            $admins = $this->projectUserRepository->findAdminsByProject($id);
            if (count($admins) === 1) {
                $targetProjectUser = $this->projectUserRepository->findByUserAndProject($userId, $id);
                if ($targetProjectUser && $targetProjectUser->isAdmin()) {
                    return $this->json(['error' => 'Impossible de retirer le dernier administrateur'], 400);
                }
            }
        }

        $projectUser = $this->projectUserRepository->findByUserAndProject($userId, $id);
        if (!$projectUser) {
            return $this->json(['error' => 'Utilisateur non trouvé dans ce projet'], 404);
        }

        $projectUser->setRole($role);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'message' => 'Rôle mis à jour avec succès',
            'user' => [
                'id' => $projectUser->getUser()->getId(),
                'firstname' => $projectUser->getUser()->getFirstname(),
                'lastname' => $projectUser->getUser()->getLastname(),
                'email' => $projectUser->getUser()->getEmail(),
                'role' => $role
            ]
        ]);
    }

    #[Route('/{id}/remove-user', name: 'remove_user_from_project', methods: ['DELETE'])]
    #[IsGranted('ROLE_USER')]
    public function removeUserFromProject(int $id, Request $request): JsonResponse
    {
        /** @var User $currentUser */
        $currentUser = $this->getUser();
        
        $project = $this->projectRepository->find($id);
        
        if (!$project) {
            return $this->json(['error' => 'Projet non trouvé'], 404);
        }

        // Vérifier si l'utilisateur actuel est admin du projet
        $currentUserProject = $this->projectUserRepository->findByUserAndProject($currentUser->getId(), $id);
        if (!$currentUserProject || !$currentUserProject->isAdmin()) {
            return $this->json(['error' => 'Seuls les administrateurs peuvent supprimer des utilisateurs'], 403);
        }

        $data = json_decode($request->getContent(), true);
        $userId = $data['userId'] ?? null;

        if (!$userId) {
            return $this->json(['error' => 'userId requis'], 400);
        }

        // Empêcher de supprimer le dernier admin
        $admins = $this->projectUserRepository->findAdminsByProject($id);
        if (count($admins) === 1) {
            $targetProjectUser = $this->projectUserRepository->findByUserAndProject($userId, $id);
            if ($targetProjectUser && $targetProjectUser->isAdmin()) {
                return $this->json(['error' => 'Impossible de supprimer le dernier administrateur'], 400);
            }
        }

        $projectUser = $this->projectUserRepository->findByUserAndProject($userId, $id);
        if (!$projectUser) {
            return $this->json(['error' => 'Utilisateur non trouvé dans ce projet'], 404);
        }

        $this->entityManager->remove($projectUser);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'message' => 'Utilisateur supprimé du projet avec succès'
        ]);
    }
}
