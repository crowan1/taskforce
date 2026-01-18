<?php

namespace App\Tests\Controller;

use App\Controller\RoleController;
use App\Entity\Role;
use App\Repository\RoleRepository;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class RoleControllerTest extends TestCase
{
    public function testGetRoles(): void
    {
        $role = new Role();
        $role->setIdentifier('manager')->setDisplayName('Manager')->setDescription('Desc');

        $repo = $this->createMock(RoleRepository::class);
        $repo->method('findAll')->willReturn([$role]);

        $controller = new RoleControllerStub();
        $response = $controller->getRoles($repo);
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
        $this->assertSame('manager', $payload['roles'][0]['identifier']);
    }

    public function testGetRole(): void
    {
        $role = new Role();
        $role->setIdentifier('manager')->setDisplayName('Manager')->setDescription('Desc');

        $controller = new RoleControllerStub();
        $response = $controller->getRole($role);
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
        $this->assertSame('Manager', $payload['role']['displayName']);
    }

    public function testCreateRoleInvalid(): void
    {
        $controller = new RoleControllerStub();
        $request = new Request([], [], [], [], [], [], json_encode([]));

        $response = $controller->createRole($request, $this->createMock(EntityManagerInterface::class));
        $payload = json_decode($response->getContent(), true);

        $this->assertFalse($payload['success']);
    }

    public function testCreateRoleSuccess(): void
    {
        $controller = new RoleControllerStub();
        $entityManager = $this->createMock(EntityManagerInterface::class);

        $request = new Request([], [], [], [], [], [], json_encode([
            'identifier' => 'manager',
            'displayName' => 'Manager',
            'description' => 'Desc'
        ]));

        $response = $controller->createRole($request, $entityManager);
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
        $this->assertSame('manager', $payload['role']['identifier']);
    }

    public function testUpdateRole(): void
    {
        $role = new Role();
        $role->setIdentifier('manager')->setDisplayName('Manager');

        $controller = new RoleControllerStub();
        $request = new Request([], [], [], [], [], [], json_encode([
            'displayName' => 'Updated',
            'description' => 'Desc'
        ]));

        $response = $controller->updateRole($role, $request, $this->createMock(EntityManagerInterface::class));
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
        $this->assertSame('Updated', $payload['role']['displayName']);
    }

    public function testDeleteRole(): void
    {
        $role = new Role();
        $controller = new RoleControllerStub();

        $response = $controller->deleteRole($role, $this->createMock(EntityManagerInterface::class));
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
    }
}

class RoleControllerStub extends RoleController
{
    protected function json($data, int $status = 200, array $headers = [], array $context = []): JsonResponse
    {
        return new JsonResponse($data, $status, $headers);
    }
}

