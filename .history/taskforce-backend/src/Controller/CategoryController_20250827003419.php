<?php

namespace App\Controller;

use App\Entity\Category;
use App\Repository\CategoryRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Security;

#[Route('/api/categories')]
class CategoryController extends AbstractController
{
    private EntityManagerInterface $entityManager;
    private CategoryRepository $categoryRepository;
    private Security $security;

    public function __construct(
        EntityManagerInterface $entityManager,
        CategoryRepository $categoryRepository,
        Security $security
    ) {
        $this->entityManager = $entityManager;
        $this->categoryRepository = $categoryRepository;
        $this->security = $security;
    }

    #[Route('', methods: ['GET'])]
    public function getCategories(): JsonResponse
    {
        $categories = $this->categoryRepository->findActiveCategories();
        
        $data = array_map(function (Category $category) {
            return [
                'id' => $category->getId(),
                'name' => $category->getName(),
                'description' => $category->getDescription(),
                'color' => $category->getColor(),
                'isActive' => $category->isActive(),
                'createdAt' => $category->getCreatedAt()->format('Y-m-d H:i:s'),
                'updatedAt' => $category->getUpdatedAt()->format('Y-m-d H:i:s'),
                'createdBy' => [
                    'id' => $category->getCreatedBy()->getId(),
                    'firstname' => $category->getCreatedBy()->getFirstname(),
                    'lastname' => $category->getCreatedBy()->getLastname(),
                    'email' => $category->getCreatedBy()->getEmail()
                ]
            ];
        }, $categories);

        return $this->json($data);
    }

    #[Route('', methods: ['POST'])]
    public function createCategory(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $user = $this->security->getUser();

        if (!$user) {
            return $this->json(['error' => 'Utilisateur non authentifié'], 401);
        }

        if (!isset($data['name']) || empty($data['name'])) {
            return $this->json(['error' => 'Le nom de la catégorie est requis'], 400);
        }

        $category = new Category();
        $category->setName($data['name']);
        $category->setDescription($data['description'] ?? null);
        $category->setColor($data['color'] ?? '#007bff');
        $category->setCreatedBy($user);

        $this->entityManager->persist($category);
        $this->entityManager->flush();

        return $this->json([
            'id' => $category->getId(),
            'name' => $category->getName(),
            'description' => $category->getDescription(),
            'color' => $category->getColor(),
            'isActive' => $category->isActive(),
            'createdAt' => $category->getCreatedAt()->format('Y-m-d H:i:s'),
            'updatedAt' => $category->getUpdatedAt()->format('Y-m-d H:i:s'),
            'createdBy' => [
                'id' => $category->getCreatedBy()->getId(),
                'firstname' => $category->getCreatedBy()->getFirstname(),
                'lastname' => $category->getCreatedBy()->getLastname(),
                'email' => $category->getCreatedBy()->getEmail()
            ]
        ], 201);
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function updateCategory(int $id, Request $request): JsonResponse
    {
        $category = $this->categoryRepository->find($id);
        
        if (!$category) {
            return $this->json(['error' => 'Catégorie non trouvée'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['name'])) {
            $category->setName($data['name']);
        }
        
        if (isset($data['description'])) {
            $category->setDescription($data['description']);
        }
        
        if (isset($data['color'])) {
            $category->setColor($data['color']);
        }

        $this->entityManager->flush();

        return $this->json([
            'id' => $category->getId(),
            'name' => $category->getName(),
            'description' => $category->getDescription(),
            'color' => $category->getColor(),
            'isActive' => $category->isActive(),
            'createdAt' => $category->getCreatedAt()->format('Y-m-d H:i:s'),
            'updatedAt' => $category->getUpdatedAt()->format('Y-m-d H:i:s'),
            'createdBy' => [
                'id' => $category->getCreatedBy()->getId(),
                'firstname' => $category->getCreatedBy()->getFirstname(),
                'lastname' => $category->getCreatedBy()->getLastname(),
                'email' => $category->getCreatedBy()->getEmail()
            ]
        ]);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function deleteCategory(int $id): JsonResponse
    {
        $category = $this->categoryRepository->find($id);
        
        if (!$category) {
            return $this->json(['error' => 'Catégorie non trouvée'], 404);
        }

        $category->setIsActive(false);
        $this->entityManager->flush();

        return $this->json(['message' => 'Catégorie supprimée avec succès']);
    }
}
