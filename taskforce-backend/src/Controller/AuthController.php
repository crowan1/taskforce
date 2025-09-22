<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;

#[Route('/api', name: 'api_')]
class AuthController extends AbstractController
{
    private EntityManagerInterface $entityManager;
    private UserPasswordHasherInterface $passwordHasher;
    private ValidatorInterface $validator;
    private JWTTokenManagerInterface $jwtManager;

    public function __construct(
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher,
        ValidatorInterface $validator,
        JWTTokenManagerInterface $jwtManager
    ) {
        $this->entityManager = $entityManager;
        $this->passwordHasher = $passwordHasher;
        $this->validator = $validator;
        $this->jwtManager = $jwtManager;
    }

    #[Route('/register', name: 'register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$this->validateRequiredFields($data, ['email', 'password', 'firstname', 'lastname'])) {
            return $this->errorResponse('Email, mot de passe, prénom et nom sont requis', Response::HTTP_BAD_REQUEST);
        }

        if ($this->emailExists($data['email'])) {
            return $this->errorResponse('Cet email est déjà utilisé', Response::HTTP_CONFLICT);
        }

        $user = new User();
        $user->setEmail($data['email']);
        $user->setFirstname($data['firstname']);
        $user->setLastname($data['lastname']);

        $hashedPassword = $this->passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);

        $validationErrors = $this->validateUser($user);
        if ($validationErrors) {
            return $this->errorResponse('Données invalides', Response::HTTP_BAD_REQUEST, $validationErrors);
        }

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        $token = $this->jwtManager->create($user);

        return new JsonResponse([
            'message' => 'Utilisateur créé avec succès',
            'token' => $token,
            'user' => $this->formatUserResponse($user)
        ], Response::HTTP_CREATED);
    }

    #[Route('/login', name: 'login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['username']) && !isset($data['email'])) {
            return $this->errorResponse('Email ou username requis', Response::HTTP_BAD_REQUEST);
        }

        if (!isset($data['password'])) {
            return $this->errorResponse('Mot de passe requis', Response::HTTP_BAD_REQUEST);
        }

        $email = $data['username'] ?? $data['email'];

        $user = $this->entityManager
            ->getRepository(User::class)
            ->findOneBy(['email' => $email]);

        if (!$user) {
            return $this->errorResponse('Utilisateur non trouvé', Response::HTTP_UNAUTHORIZED);
        }

        if (!$this->passwordHasher->isPasswordValid($user, $data['password'])) {
            return $this->errorResponse('Mot de passe incorrect', Response::HTTP_UNAUTHORIZED);
        }

        $token = $this->jwtManager->create($user);

        $cookie = Cookie::create('auth_token')
            ->withValue($token)
            ->withExpires(new \DateTime('+24 hours'))
            ->withPath('/')
            ->withSecure(true)
            ->withHttpOnly(true)
            ->withSameSite('Strict');

        $response = new JsonResponse([
            'message' => 'Connexion réussie',
            'token' => $token,
            'user' => $this->formatUserResponse($user)
        ]);

        $response->headers->setCookie($cookie);
        return $response;
    }

    #[Route('/logout', name: 'logout', methods: ['POST'])]
    public function logout(): JsonResponse
    {
        $cookie = Cookie::create('auth_token')
            ->withValue('')
            ->withExpires(new \DateTime('-1 hour'))
            ->withPath('/')
            ->withSecure(true)
            ->withHttpOnly(true)
            ->withSameSite('Strict');

        $response = new JsonResponse([
            'message' => 'Déconnexion réussie'
        ]);

        $response->headers->setCookie($cookie);
        return $response;
    }

    #[Route('/user', name: 'user_profile', methods: ['GET'])]
    public function getUserProfile(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        if (!$user) {
            return $this->errorResponse('Utilisateur non authentifié', Response::HTTP_UNAUTHORIZED);
        }

        return new JsonResponse($this->formatUserResponse($user));
    }

    #[Route('/user', name: 'update_user_profile', methods: ['PUT'])]
    public function updateUserProfile(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        if (!$user) {
            return $this->errorResponse('Utilisateur non authentifié', Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);

        if (!$this->validateRequiredFields($data, ['email', 'firstname', 'lastname'])) {
            return $this->errorResponse('Email, prénom et nom sont requis', Response::HTTP_BAD_REQUEST);
        }

        if ($data['email'] !== $user->getEmail() && $this->emailExists($data['email'])) {
            return $this->errorResponse('Cet email est déjà utilisé', Response::HTTP_CONFLICT);
        }

        $user->setEmail($data['email']);
        $user->setFirstname($data['firstname']);
        $user->setLastname($data['lastname']);

        $validationErrors = $this->validateUser($user);
        if ($validationErrors) {
            return $this->errorResponse('Données invalides', Response::HTTP_BAD_REQUEST, $validationErrors);
        }

        $this->entityManager->flush();

        return new JsonResponse([
            'message' => 'Profil mis à jour avec succès',
            'user' => $this->formatUserResponse($user)
        ]);
    }

    private function formatUserResponse(User $user): array
    {
        return [
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'firstname' => $user->getFirstname(),
            'lastname' => $user->getLastname(),
            'roles' => $user->getRoles(),
            'createdAt' => $user->getCreatedAt() ? $user->getCreatedAt()->format('Y-m-d H:i:s') : null,
            'updatedAt' => $user->getUpdatedAt() ? $user->getUpdatedAt()->format('Y-m-d H:i:s') : null
        ];
    }

    private function validateRequiredFields(array $data, array $fields): bool
    {
        foreach ($fields as $field) {
            if (!isset($data[$field])) {
                return false;
            }
        }
        return true;
    }

    private function emailExists(string $email): bool
    {
        $existingUser = $this->entityManager
            ->getRepository(User::class)
            ->findOneBy(['email' => $email]);
        
        return $existingUser !== null;
    }

    private function validateUser(User $user): ?array
    {
        $violations = $this->validator->validate($user);
        
        if (count($violations) > 0) {
            $errors = [];
            foreach ($violations as $violation) {
                $errors[] = $violation->getMessage();
            }
            return $errors;
        }
        
        return null;
    }

    private function errorResponse(string $message, int $status, ?array $errors = null): JsonResponse
    {
        $response = [
            'error' => $message,
            'message' => $message
        ];
        
        if ($errors) {
            $response['errors'] = $errors;
        }
        
        return new JsonResponse($response, $status);
    }
}
