<?php

namespace App\Tests\Controller;

use App\Controller\SkillController;
use App\Entity\Skill;
use App\Entity\User;
use App\Repository\SkillRepository;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class SkillControllerTest extends TestCase
{
    public function testGetSkills(): void
    {
        $user = $this->makeUser();
        $skill = new Skill();
        $skill->setName('PHP')->setDescription('Backend')->setCreatedBy($user);
        $skill->setCreatedAt(new \DateTimeImmutable('2024-01-01 10:00:00'));

        $repo = $this->createMock(SkillRepository::class);
        $repo->method('findActiveSkills')->willReturn([$skill]);

        $controller = new SkillControllerStub($this->createMock(EntityManagerInterface::class), $repo);
        $response = $controller->getSkills();
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
        $this->assertSame('PHP', $payload['skills'][0]['name']);
    }

    public function testCreateSkillInvalid(): void
    {
        $controller = new SkillControllerStub($this->createMock(EntityManagerInterface::class), $this->createMock(SkillRepository::class));
        $controller->setUser($this->makeUser());

        $response = $controller->createSkill(new Request([], [], [], [], [], [], json_encode([])));
        $payload = json_decode($response->getContent(), true);

        $this->assertFalse($payload['success']);
    }

    public function testCreateSkillSuccess(): void
    {
        $user = $this->makeUser();
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->method('persist')->willReturnCallback(function (object $entity) {
            if (method_exists($entity, 'setCreatedAtValue')) {
                $entity->setCreatedAtValue();
            } elseif (method_exists($entity, 'setCreatedAt')) {
                $entity->setCreatedAt(new \DateTimeImmutable());
            }
        });

        $controller = new SkillControllerStub($entityManager, $this->createMock(SkillRepository::class));
        $controller->setUser($user);

        $request = new Request([], [], [], [], [], [], json_encode([
            'name' => 'Laravel',
            'description' => 'Framework'
        ]));

        $response = $controller->createSkill($request);
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
        $this->assertSame('Laravel', $payload['skill']['name']);
    }

    private function makeUser(): User
    {
        $user = new User();
        $user->setEmail('user@example.com')->setFirstname('John')->setLastname('Doe');
        $user->setCreatedAt(new \DateTimeImmutable('2024-01-01 10:00:00'));
        $user->setUpdatedAt(new \DateTimeImmutable('2024-01-02 10:00:00'));
        $this->setId($user, 1);

        return $user;
    }

    private function setId(object $entity, int $id): void
    {
        $reflection = new \ReflectionClass($entity);
        $prop = $reflection->getProperty('id');
        $prop->setAccessible(true);
        $prop->setValue($entity, $id);
    }
}

class SkillControllerStub extends SkillController
{
    private ?User $user = null;

    public function setUser(?User $user): void
    {
        $this->user = $user;
    }

    protected function getUser(): ?User
    {
        return $this->user;
    }

    protected function json($data, int $status = 200, array $headers = [], array $context = []): JsonResponse
    {
        return new JsonResponse($data, $status, $headers);
    }
}

