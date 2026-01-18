<?php

namespace App\Tests\Controller;

use App\Controller\UserController;
use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\JsonResponse;

class UserControllerTest extends TestCase
{
    public function testGetUsersSuccess(): void
    {
        $user = new User();
        $user->setEmail('test@example.com')
            ->setFirstname('John')
            ->setLastname('Doe')
            ->setMaxWorkloadHours(40.0)
            ->setCreatedAt(new \DateTimeImmutable('2024-01-01 10:00:00'));

        $userRepository = $this->createMock(UserRepository::class);
        $userRepository->method('findAll')->willReturn([$user]);

        $controller = new UserControllerStub(
            $this->createMock(EntityManagerInterface::class),
            $userRepository
        );

        $response = $controller->getUsers();
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
        $this->assertCount(1, $payload['users']);
        $this->assertSame('test@example.com', $payload['users'][0]['email']);
    }
}

class UserControllerStub extends UserController
{
    protected function json($data, int $status = 200, array $headers = [], array $context = []): JsonResponse
    {
        return new JsonResponse($data, $status, $headers);
    }
}

