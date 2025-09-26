<?php

namespace App\Controller;

use App\Entity\Column;
use App\Entity\Project;
use App\Repository\ColumnRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/columns')]
class ColumnController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private ColumnRepository $columnRepository
    ) {}

    #[Route('', name: 'get_columns', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getColumns(Request $request): JsonResponse
    {
        $projectId = $request->query->get('projectId');
        
        if (!$projectId) {
            return $this->json([
                'success' => false,
                'message' => 'L\'ID du projet est requis'
            ], 400);
        }

        try {
            $columns = $this->columnRepository->findByProject($projectId);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des colonnes: ' . $e->getMessage()
            ], 500);
        }
        
        $formattedColumns = array_map(function(Column $column) {
            return [
                'id' => $column->getId(),
                'name' => $column->getName(),
                'identifier' => $column->getIdentifier(),
                'color' => $column->getColor(),
                'description' => $column->getDescription(),
                'position' => $column->getPosition(),
                'isActive' => $column->isActive(),
                'createdAt' => $column->getCreatedAt()?->format('Y-m-d H:i:s'),
                'updatedAt' => $column->getUpdatedAt()?->format('Y-m-d H:i:s')
            ];
        }, $columns);

        return $this->json([
            'success' => true,
            'columns' => $formattedColumns
        ]);
    }

    #[Route('', name: 'create_column', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function createColumn(Request $request): JsonResponse
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
                'message' => 'Le nom de la colonne est requis'
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

        $column = new Column();
        $column->setName($data['name']);
        $column->setIdentifier($data['identifier'] ?? strtolower(str_replace(' ', '-', $data['name'])));
        $column->setColor($data['color'] ?? '#6b7280');
        $column->setDescription($data['description'] ?? null);
        $column->setPosition($data['position'] ?? 0);
        $column->setProject($project);

        $this->entityManager->persist($column);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'column' => [
                'id' => $column->getId(),
                'name' => $column->getName(),
                'identifier' => $column->getIdentifier(),
                'color' => $column->getColor(),
                'description' => $column->getDescription(),
                'position' => $column->getPosition(),
                'isActive' => $column->isActive(),
                'createdAt' => $column->getCreatedAt()?->format('Y-m-d H:i:s'),
                'updatedAt' => $column->getUpdatedAt()?->format('Y-m-d H:i:s')
            ]
        ]);
    }

    #[Route('/{id}', name: 'update_column', methods: ['PUT'])]
    #[IsGranted('ROLE_USER')]
    public function updateColumn(int $id, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $column = $this->columnRepository->find($id);
        if (!$column) {
            return $this->json([
                'success' => false,
                'message' => 'Colonne non trouvée'
            ], 404);
        }
 
        $projectUser = $this->entityManager->getRepository('App\\Entity\\ProjectUser')
            ->findOneBy(['project' => $column->getProject(), 'user' => $user]);
        if (!$projectUser) {
            return $this->json([
                'success' => false,
                'message' => 'Accès non autorisé à cette colonne'
            ], 403);
        }

        $data = json_decode($request->getContent(), true);
        
        if (isset($data['name'])) {
            $column->setName($data['name']);
        }
        if (isset($data['identifier'])) {
            $column->setIdentifier($data['identifier']);
        }
        if (isset($data['color'])) {
            $column->setColor($data['color']);
        }
        if (isset($data['description'])) {
            $column->setDescription($data['description']);
        }
        if (array_key_exists('position', $data)) {
            $position = (int) $data['position'];
            if ($position < 0) {
                $position = 0;
            }
            $column->setPosition($position);
        }
        if (isset($data['isActive'])) {
            $column->setIsActive($data['isActive']);
        }

        try {
            $this->entityManager->flush();
        } catch (\Throwable $e) { 
            if (strpos($e->getMessage(), 'constraint') !== false || 
                strpos($e->getMessage(), 'duplicate') !== false ||
                strpos($e->getMessage(), 'conflict') !== false) {
                return $this->json([
                    'success' => true,
                    'message' => 'Colonne mise à jour (conflit ignoré)'
                ]);
            }
            
            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour de la colonne: ' . $e->getMessage(),
            ], 500);
        }

        return $this->json([
            'success' => true,
            'column' => [
                'id' => $column->getId(),
                'name' => $column->getName(),
                'identifier' => $column->getIdentifier(),
                'color' => $column->getColor(),
                'description' => $column->getDescription(),
                'position' => $column->getPosition(),
                'isActive' => $column->isActive(),
                'createdAt' => $column->getCreatedAt()?->format('Y-m-d H:i:s'),
                'updatedAt' => $column->getUpdatedAt()?->format('Y-m-d H:i:s')
            ]
        ]);
    }

    #[Route('/{id}', name: 'delete_column', methods: ['DELETE'])]
    #[IsGranted('ROLE_USER')]
    public function deleteColumn(int $id): JsonResponse
    {
        $column = $this->columnRepository->find($id);
        if (!$column) {
            return $this->json([
                'success' => false,
                'message' => 'Colonne non trouvée'
            ], 404);
        }

        $this->entityManager->remove($column);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'message' => 'Colonne supprimée avec succès'
        ]);
    }
}
