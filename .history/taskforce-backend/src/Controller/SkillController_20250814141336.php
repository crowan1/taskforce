<?php

namespace App\Controller;

use App\Entity\Skill;
use App\Repository\SkillRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/skills')]
class SkillController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private SkillRepository $skillRepository
    ) {}

    #[Route('', name: 'get_skills', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getSkills(): JsonResponse
    {
        $skills = $this->skillRepository->findActiveSkills();
        
        $formattedSkills = array_map(function(Skill $skill) {
            return [
                'id' => $skill->getId(),
                'name' => $skill->getName(),
                'description' => $skill->getDescription(),
                'category' => $skill->getCategory(),
                'level' => $skill->getLevel(),
                'isActive' => $skill->isActive(),
                'createdAt' => $skill->getCreatedAt()->format('Y-m-d H:i:s'),
                'updatedAt' => $skill->getUpdatedAt()->format('Y-m-d H:i:s')
            ];
        }, $skills);

        return $this->json([
            'success' => true,
            'skills' => $formattedSkills
        ]);
    }

    #[Route('/categories', name: 'get_skill_categories', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getSkillCategories(): JsonResponse
    {
        $categories = $this->skillRepository->createQueryBuilder('s')
            ->select('DISTINCT s.category')
            ->where('s.isActive = :isActive')
            ->setParameter('isActive', true)
            ->orderBy('s.category', 'ASC')
            ->getQuery()
            ->getResult();

        $categoryList = array_map(function($item) {
            return $item['category'];
        }, $categories);

        return $this->json([
            'success' => true,
            'categories' => $categoryList
        ]);
    }

    #[Route('', name: 'create_skill', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function createSkill(Request $request): JsonResponse
    {
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
                'message' => 'Le nom de la compétence est requis'
            ], 400);
        }

        $skill = new Skill();
        $skill->setName($data['name']);
        $skill->setDescription($data['description'] ?? null);
        $skill->setCategory($data['category'] ?? 'Général');
        $skill->setLevel($data['level'] ?? 1);

        $this->entityManager->persist($skill);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'skill' => [
                'id' => $skill->getId(),
                'name' => $skill->getName(),
                'description' => $skill->getDescription(),
                'category' => $skill->getCategory(),
                'level' => $skill->getLevel(),
                'isActive' => $skill->isActive(),
                'createdAt' => $skill->getCreatedAt()->format('Y-m-d H:i:s'),
                'updatedAt' => $skill->getUpdatedAt()->format('Y-m-d H:i:s')
            ]
        ]);
    }

    #[Route('/{id}', name: 'update_skill', methods: ['PUT'])]
    #[IsGranted('ROLE_USER')]
    public function updateSkill(int $id, Request $request): JsonResponse
    {
        $skill = $this->skillRepository->find($id);
        if (!$skill) {
            return $this->json([
                'success' => false,
                'message' => 'Compétence non trouvée'
            ], 404);
        }

        $data = json_decode($request->getContent(), true);
        
        if (isset($data['name'])) {
            $skill->setName($data['name']);
        }
        if (isset($data['description'])) {
            $skill->setDescription($data['description']);
        }
        if (isset($data['category'])) {
            $skill->setCategory($data['category']);
        }
        if (isset($data['level'])) {
            $skill->setLevel($data['level']);
        }
        if (isset($data['isActive'])) {
            $skill->setIsActive($data['isActive']);
        }

        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'skill' => [
                'id' => $skill->getId(),
                'name' => $skill->getName(),
                'description' => $skill->getDescription(),
                'category' => $skill->getCategory(),
                'level' => $skill->getLevel(),
                'isActive' => $skill->isActive(),
                'createdAt' => $skill->getCreatedAt()->format('Y-m-d H:i:s'),
                'updatedAt' => $skill->getUpdatedAt()->format('Y-m-d H:i:s')
            ]
        ]);
    }

    #[Route('/{id}', name: 'delete_skill', methods: ['DELETE'])]
    #[IsGranted('ROLE_USER')]
    public function deleteSkill(int $id): JsonResponse
    {
        $skill = $this->skillRepository->find($id);
        if (!$skill) {
            return $this->json([
                'success' => false,
                'message' => 'Compétence non trouvée'
            ], 404);
        }

        $this->entityManager->remove($skill);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'message' => 'Compétence supprimée avec succès'
        ]);
    }
}
