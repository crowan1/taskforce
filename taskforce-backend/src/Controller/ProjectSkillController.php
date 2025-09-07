<?php

namespace App\Controller;

use App\Entity\Project;
use App\Service\ProjectSkillService;
use App\Repository\ProjectRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/projects')]
class ProjectSkillController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private ProjectRepository $projectRepository,
        private ProjectSkillService $projectSkillService
    ) {}

    #[Route('/{id}/skills/users', name: 'get_project_user_skills', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getProjectUserSkills(int $id): JsonResponse
    {
        $project = $this->projectRepository->find($id);
        if (!$project) {
            return $this->json([
                'success' => false,
                'message' => 'Projet non trouvé'
            ], 404);
        }
 
        $projectUser = $this->entityManager->getRepository('App\Entity\ProjectUser')
            ->findOneBy(['project' => $project, 'user' => $this->getUser()]);
        
        if (!$projectUser) {
            return $this->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        $skills = $this->projectSkillService->getProjectUserSkills($project);

        return $this->json([
            'success' => true,
            'skills' => $skills
        ]);
    }

    #[Route('/{id}/skills/available', name: 'get_available_project_skills', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getAllAvailableProjectSkills(int $id): JsonResponse
    {
        $project = $this->projectRepository->find($id);
        if (!$project) {
            return $this->json([
                'success' => false,
                'message' => 'Projet non trouvé'
            ], 404);
        }
 
        $projectUser = $this->entityManager->getRepository('App\Entity\ProjectUser')
            ->findOneBy(['project' => $project, 'user' => $this->getUser()]);
        
        if (!$projectUser) {
            return $this->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        $skills = $this->projectSkillService->getAllAvailableProjectSkills($project);
        $hasUsers = $this->projectSkillService->hasProjectUsers($project);

        return $this->json([
            'success' => true,
            'skills' => $skills,
            'hasUsers' => $hasUsers
        ]);
    }

    #[Route('/{id}/skills', name: 'create_project_skill', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function createProjectSkill(int $id, Request $request): JsonResponse
    {
        $project = $this->projectRepository->find($id);
        if (!$project) {
            return $this->json([
                'success' => false,
                'message' => 'Projet non trouvé'
            ], 404);
        }
 
        $projectUser = $this->entityManager->getRepository('App\Entity\ProjectUser')
            ->findOneBy(['project' => $project, 'user' => $this->getUser()]);
        
        if (!$projectUser || !in_array($projectUser->getRole(), ['responsable_projet', 'manager'])) {
            return $this->json([
                'success' => false,
                'message' => 'Accès non autorisé. Seuls les responsables et managers peuvent ajouter des compétences.'
            ], 403);
        }

        $data = json_decode($request->getContent(), true);
        if (!$data || empty($data['name'])) {
            return $this->json([
                'success' => false,
                'message' => 'Le nom de la compétence est requis'
            ], 400);
        }
 
        $projectSkillRepository = $this->entityManager->getRepository('App\Entity\ProjectSkill');
        if ($projectSkillRepository->existsForProject($project, $data['name'])) {
            return $this->json([
                'success' => false,
                'message' => 'Cette compétence existe déjà pour ce projet'
            ], 400);
        }

        try {
            $projectSkill = $this->projectSkillService->createProjectSkill(
                $project,
                $this->getUser(),
                $data['name'],
                $data['description'] ?? null
            );

            return $this->json([
                'success' => true,
                'message' => 'Compétence ajoutée avec succès',
                'skill' => [
                    'id' => 'project_' . $projectSkill->getId(),
                    'name' => $projectSkill->getName(),
                    'description' => $projectSkill->getDescription(),
                    'type' => 'project_skill',
                    'createdBy' => [
                        'id' => $projectSkill->getCreatedBy()->getId(),
                        'firstname' => $projectSkill->getCreatedBy()->getFirstname(),
                        'lastname' => $projectSkill->getCreatedBy()->getLastname()
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de la création de la compétence: ' . $e->getMessage()
            ], 500);
        }
    }

    #[Route('/skills/{skillId}', name: 'delete_project_skill', methods: ['DELETE'])]
    #[IsGranted('ROLE_USER')]
    public function deleteProjectSkill(int $skillId): JsonResponse
    {
        $projectSkill = $this->entityManager->getRepository('App\Entity\ProjectSkill')->find($skillId);
        if (!$projectSkill) {
            return $this->json([
                'success' => false,
                'message' => 'Compétence non trouvée'
            ], 404);
        }
 
        if ($projectSkill->getCreatedBy()->getId() !== $this->getUser()->getId()) {
            return $this->json([
                'success' => false,
                'message' => 'Seul le créateur de la compétence peut la supprimer'
            ], 403);
        }

        try {
            $this->projectSkillService->deleteProjectSkill($projectSkill);

            return $this->json([
                'success' => true,
                'message' => 'Compétence supprimée avec succès'
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de la compétence: ' . $e->getMessage()
            ], 500);
        }
    }
}
