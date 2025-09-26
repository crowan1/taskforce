<?php

namespace App\Controller;

use App\Entity\Project;
use App\Entity\User;
use App\Entity\ProjectUser;
use App\Entity\Role;
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
        
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
        try {
            $projects = $this->projectRepository->findByUser($user->getId());
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des projets: ' . $e->getMessage()
            ], 500);
        }
        
        $formattedProjects = array_map(function(Project $project) {
            return [
                'id' => $project->getId(),
                'name' => $project->getName(),
                'description' => $project->getDescription(),
                'status' => $project->getStatus(),
                'createdAt' => $project->getCreatedAt() ? $project->getCreatedAt()->format('Y-m-d H:i:s') : null,
                'updatedAt' => $project->getUpdatedAt() ? $project->getUpdatedAt()->format('Y-m-d H:i:s') : null,
                'createdBy' => [
                    'id' => $project->getCreatedBy() ? $project->getCreatedBy()->getId() : null,
                    'firstname' => $project->getCreatedBy() ? $project->getCreatedBy()->getFirstname() : null,
                    'lastname' => $project->getCreatedBy() ? $project->getCreatedBy()->getLastname() : null,
                    'email' => $project->getCreatedBy() ? $project->getCreatedBy()->getEmail() : null
                ],
                'users' => array_map(function($projectUser) {
                    return [
                        'id' => $projectUser->getUser()->getId(),
                        'firstname' => $projectUser->getUser()->getFirstname(),
                        'lastname' => $projectUser->getUser()->getLastname(),
                        'email' => $projectUser->getUser()->getEmail(),
                        'role' => $projectUser->getRoleIdentifier(),
                        'joinedAt' => $projectUser->getJoinedAt() ? $projectUser->getJoinedAt()->format('Y-m-d H:i:s') : null
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
         
        if (!$user->isPremium()) {
            $userProjects = $this->projectRepository->countByUser($user->getId());
            if ($userProjects >= 2) {
                return $this->json([
                    'success' => false,
                    'message' => 'Limite de 2 projets atteinte. Passez au plan Premium pour créer plus de projets !',
                    'upgrade_required' => true
                ], 403);
            }
        }
        
        $data = json_decode($request->getContent(), true);
        
        if (!$data) {
            return $this->json([
                'success' => false,
                'message' => 'Données invalides'
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

        //   créateur = responsable de projet
        $projectUser = new ProjectUser();
        $projectUser->setProject($project);
        $projectUser->setUser($user);
        $roleRepository = $this->entityManager->getRepository(Role::class);
        $responsableRole = $roleRepository->findOneBy(['identifier' => 'responsable_projet']);
        $projectUser->setRole($responsableRole);

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
                'users' => [
                    [
                        'id' => $user->getId(),
                        'firstname' => $user->getFirstname(),
                        'lastname' => $user->getLastname(),
                        'email' => $user->getEmail(),
                        'role' => $responsableRole->getIdentifier(),
                        'joinedAt' => $projectUser->getJoinedAt()->format('Y-m-d H:i:s')
                    ]
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
 
        $currentUserProject = $this->projectUserRepository->findByUserAndProject($currentUser->getId(), $id);
        if (!$currentUserProject || !$currentUserProject->isResponsableProjet()) {
            return $this->json(['error' => 'Seuls les responsables de projet peuvent ajouter des utilisateurs'], 403);
        }

        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? null;
        $role = $data['role'] ?? 'collaborateur';

        if (!$email) {
            return $this->json(['error' => 'Email requis'], 400);
        }
 
        $roleRepository = $this->entityManager->getRepository(Role::class);
        $roleEntity = $roleRepository->findOneBy(['identifier' => $role]);
        if (!$roleEntity) {
            return $this->json(['error' => 'Rôle invalide'], 400);
        }

        $userRepository = $this->entityManager->getRepository(User::class);
        $user = $userRepository->findOneBy(['email' => $email]);

        if (!$user) {
            return $this->json(['error' => 'Aucun utilisateur trouvé avec cet email: ' . $email], 404);
        } 

        $existingProjectUser = $this->projectUserRepository->findByUserAndProject($user->getId(), $id);
        if ($existingProjectUser) {
            return $this->json(['error' => 'L\'utilisateur ' . $user->getFirstname() . ' ' . $user->getLastname() . ' est déjà dans ce projet'], 400);
        }

        $projectUser = new ProjectUser();
        $projectUser->setProject($project);
        $projectUser->setUser($user);
        $projectUser->setRole($roleEntity);

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
                'role' => $roleEntity->getIdentifier()
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
 
        $currentUserProject = $this->projectUserRepository->findByUserAndProject($currentUser->getId(), $id);
        if (!$currentUserProject || !$currentUserProject->isResponsableProjet()) {
            return $this->json(['error' => 'Seuls les responsables de projet peuvent modifier les rôles'], 403);
        }

        $data = json_decode($request->getContent(), true);
        $userId = $data['userId'] ?? null;
        $role = $data['role'] ?? null;

        if (!$userId || !$role) {
            return $this->json(['error' => 'userId et role requis'], 400);
        }

        $roleEntity = $this->entityManager->getRepository(Role::class)->findOneBy(['identifier' => $role]);
        if (!$roleEntity) {
            return $this->json(['error' => 'Rôle invalide'], 400);
        }

        if ($roleEntity->getIdentifier() === 'responsable_projet' && !$currentUserProject->isResponsableProjet()) {
            return $this->json(['error' => 'Seuls les responsables de projet peuvent promouvoir vers ce rôle'], 403);
        }

        $projectUser = $this->projectUserRepository->findByUserAndProject($userId, $id);
        if (!$projectUser) {
            return $this->json(['error' => 'Utilisateur non trouvé dans ce projet'], 404);
        }

        $projectUser->setRole($roleEntity);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'message' => 'Rôle mis à jour avec succès',
            'user' => [
                'id' => $projectUser->getUser()->getId(),
                'firstname' => $projectUser->getUser()->getFirstname(),
                'lastname' => $projectUser->getUser()->getLastname(),
                'email' => $projectUser->getUser()->getEmail(),
                'role' => $roleEntity->getIdentifier()
            ]
        ]);
    }

    #[Route('/{id}/users', name: 'get_project_users', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getProjectUsers(int $id): JsonResponse
    {
        /** @var User $currentUser */
        $currentUser = $this->getUser();
        
        $project = $this->projectRepository->find($id);
        
        if (!$project) {
            return $this->json(['error' => 'Projet non trouvé'], 404);
        }

        $currentUserProject = $this->projectUserRepository->findByUserAndProject($currentUser->getId(), $id);
        if (!$currentUserProject) {
            return $this->json(['error' => 'Vous n\'avez pas accès à ce projet'], 403);
        }

        $projectUsers = $this->projectUserRepository->findByProject($id);
        
        $formattedUsers = array_map(function($projectUser) {
            $user = $projectUser->getUser();
            
            $userSkills = $user->getUserSkills();
            $skills = [];
            
            foreach ($userSkills as $userSkill) {
                $skill = $userSkill->getSkill();
                $skills[] = [
                    'id' => $skill->getId(),
                    'name' => $skill->getName(),
                    'description' => $skill->getDescription()
                ];
            }
            
            return [
                'id' => $user->getId(),
                'firstname' => $user->getFirstname(),
                'lastname' => $user->getLastname(),
                'email' => $user->getEmail(),
                'role' => $projectUser->getRoleIdentifier(),
                'roleDisplayName' => $projectUser->getRoleDisplayName(),
                'joinedAt' => $projectUser->getJoinedAt()->format('Y-m-d H:i:s'),
                'skills' => $skills
            ];
        }, $projectUsers);

        return $this->json([
            'success' => true,
            'users' => $formattedUsers
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

        $currentUserProject = $this->projectUserRepository->findByUserAndProject($currentUser->getId(), $id);
        if (!$currentUserProject || !$currentUserProject->isResponsableProjet()) {
            return $this->json(['error' => 'Seuls les responsables de projet peuvent supprimer des utilisateurs'], 403);
        }

        $data = json_decode($request->getContent(), true);
        $userId = $data['userId'] ?? null;

        if (!$userId) {
            return $this->json(['error' => 'userId requis'], 400);
        }

        // Empêcher de supprimer le créateur du projet
        if ($project->getCreatedBy()->getId() === $userId) {
            return $this->json(['error' => 'Impossible de supprimer le créateur du projet'], 400);
        }
 
        $responsables = $this->projectUserRepository->findResponsablesByProject($id);
        if (count($responsables) === 1) {
            $targetProjectUser = $this->projectUserRepository->findByUserAndProject($userId, $id);
            if ($targetProjectUser && $targetProjectUser->isResponsableProjet()) {
                return $this->json(['error' => 'Impossible de supprimer le dernier responsable de projet'], 400);
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

    #[Route('/{id}', name: 'delete_project', methods: ['DELETE'])]
    #[IsGranted('ROLE_USER')]
    public function deleteProject(int $id): JsonResponse
    {
        /** @var User $currentUser */
        $currentUser = $this->getUser();
        
        $project = $this->projectRepository->find($id);
        
        if (!$project) {
            return $this->json(['error' => 'Projet non trouvé'], 404);
        }

        if ($project->getCreatedBy()->getId() !== $currentUser->getId()) {
            return $this->json(['error' => 'Seul le créateur peut supprimer le projet'], 403);
        }

        $this->entityManager->remove($project);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'message' => 'Projet supprimé avec succès'
        ]);
    }
}
