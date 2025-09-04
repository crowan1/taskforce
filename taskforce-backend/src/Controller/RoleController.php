<?php

namespace App\Controller;

use App\Entity\Role;
use App\Repository\RoleRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/roles')]
class RoleController extends AbstractController
{
    #[Route('', name: 'get_roles', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getRoles(RoleRepository $roleRepository): JsonResponse
    {
        $roles = $roleRepository->findAll();
        
        $formattedRoles = array_map(function(Role $role) {
            return [
                'id' => $role->getId(),
                'identifier' => $role->getIdentifier(),
                'displayName' => $role->getDisplayName(),
                'description' => $role->getDescription()
            ];
        }, $roles);
        
        return $this->json([
            'success' => true,
            'roles' => $formattedRoles
        ]);
    }

    #[Route('/{id}', name: 'get_role', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getRole(Role $role): JsonResponse
    {
        return $this->json([
            'success' => true,
            'role' => [
                'id' => $role->getId(),
                'identifier' => $role->getIdentifier(),
                'displayName' => $role->getDisplayName(),
                'description' => $role->getDescription()
            ]
        ]);
    }

    #[Route('', name: 'create_role', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function createRole(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['identifier']) || !isset($data['displayName'])) {
            return $this->json([
                'success' => false,
                'error' => 'Identifier et displayName sont requis'
            ], 400);
        }
        
        $role = new Role();
        $role->setIdentifier($data['identifier']);
        $role->setDisplayName($data['displayName']);
        $role->setDescription($data['description'] ?? null);
        
        $entityManager->persist($role);
        $entityManager->flush();
        
        return $this->json([
            'success' => true,
            'role' => [
                'id' => $role->getId(),
                'identifier' => $role->getIdentifier(),
                'displayName' => $role->getDisplayName(),
                'description' => $role->getDescription()
            ]
        ], 201);
    }

    #[Route('/{id}', name: 'update_role', methods: ['PUT'])]
    #[IsGranted('ROLE_ADMIN')]
    public function updateRole(Role $role, Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (isset($data['displayName'])) {
            $role->setDisplayName($data['displayName']);
        }
        
        if (isset($data['description'])) {
            $role->setDescription($data['description']);
        }
        
        $entityManager->flush();
        
        return $this->json([
            'success' => true,
            'role' => [
                'id' => $role->getId(),
                'identifier' => $role->getIdentifier(),
                'displayName' => $role->getDisplayName(),
                'description' => $role->getDescription()
            ]
        ]);
    }

    #[Route('/{id}', name: 'delete_role', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function deleteRole(Role $role, EntityManagerInterface $entityManager): JsonResponse
    {
        $entityManager->remove($role);
        $entityManager->flush();
        
        return $this->json([
            'success' => true,
            'message' => 'Rôle supprimé avec succès'
        ]);
    }
}

