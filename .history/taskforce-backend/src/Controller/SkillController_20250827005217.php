<?php

namespace App\Controller;

use App\Entity\Skill;
use App\Entity\User;
use App\Entity\Category;
use App\Repository\SkillRepository;
use App\Repository\CategoryRepository;
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
        private SkillRepository $skillRepository,
        private CategoryRepository $categoryRepository
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
                'category' => $skill->getCategory() ? $skill->getCategory()->getName() : null,
                'level' => $skill->getLevel(),
                'createdAt' => $skill->getCreatedAt()->format('Y-m-d H:i:s'),
                'createdBy' => [
                    'id' => $skill->getCreatedBy()->getId(),
                    'firstname' => $skill->getCreatedBy()->getFirstname(),
                    'lastname' => $skill->getCreatedBy()->getLastname(),
                    'email' => $skill->getCreatedBy()->getEmail()
                ]
            ];
        }, $skills);

        return $this->json([
            'success' => true,
            'skills' => $formattedSkills
        ]);
    }

    #[Route('', name: 'create_skill', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function createSkill(Request $request): JsonResponse
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

        if (empty($data['name'])) {
            return $this->json([
                'success' => false,
                'message' => 'Le nom de la compétence est requis'
            ], 400);
        }

        $skill = new Skill();
        $skill->setName($data['name']);
        $skill->setDescription($data['description'] ?? null);
        
        // Gérer la catégorie
        if (isset($data['categoryId'])) {
            $category = $this->categoryRepository->find($data['categoryId']);
            if ($category) {
                $skill->setCategory($category);
            }
        }
        
        $skill->setLevel(1); // Niveau par défaut
        $skill->setCreatedBy($user);

        $this->entityManager->persist($skill);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'message' => 'Compétence créée avec succès',
            'skill' => [
                'id' => $skill->getId(),
                'name' => $skill->getName(),
                'description' => $skill->getDescription(),
                'category' => $skill->getCategory() ? $skill->getCategory()->getName() : null,
                'level' => $skill->getLevel(),
                'createdAt' => $skill->getCreatedAt()->format('Y-m-d H:i:s'),
                'createdBy' => [
                    'id' => $skill->getCreatedBy()->getId(),
                    'firstname' => $skill->getCreatedBy()->getFirstname(),
                    'lastname' => $skill->getCreatedBy()->getLastname(),
                    'email' => $skill->getCreatedBy()->getEmail()
                ]
            ]
        ], 201);
    }
}
