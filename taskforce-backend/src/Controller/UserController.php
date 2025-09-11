<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/users')]
class UserController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserRepository $userRepository
    ) {}

    #[Route('', name: 'get_users', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getUsers(): JsonResponse
    {
        $users = $this->userRepository->findAll();
        
        $formattedUsers = array_map(function(User $user) {
            return [
                'id' => $user->getId(),
                'firstname' => $user->getFirstname(),
                'lastname' => $user->getLastname(),
                'email' => $user->getEmail(),
                'maxWorkloadHours' => $user->getMaxWorkloadHours(),
                'createdAt' => $user->getCreatedAt()->format('Y-m-d H:i:s')
            ];
        }, $users);

        return $this->json([
            'success' => true,
            'users' => $formattedUsers
        ]);
    }
}
