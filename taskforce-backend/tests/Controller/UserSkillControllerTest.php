<?php

namespace App\Tests\Controller;

use App\Controller\UserSkillController;
use App\Entity\Skill;
use App\Entity\User;
use App\Entity\UserSkill;
use App\Repository\SkillRepository;
use App\Repository\UserSkillRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class UserSkillControllerTest extends TestCase
{
    public function testGetUserSkillsUnauthorized(): void
    {
        $controller = $this->buildController();
        $controller->setUser(null);

        $response = $controller->getUserSkills();
        $payload = json_decode($response->getContent(), true);

        $this->assertArrayHasKey('error', $payload);
    }

    public function testGetUserSkillsSuccess(): void
    {
        $user = $this->makeUser(1);
        $skill = $this->makeSkill(10);
        $userSkill = new UserSkill();
        $userSkill->setUser($user)->setSkill($skill);

        $repo = $this->createMock(UserSkillRepository::class);
        $repo->method('findByUser')->with(1)->willReturn([$userSkill]);

        $controller = $this->buildController($repo);
        $controller->setUser($user);

        $response = $controller->getUserSkills();
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
        $this->assertSame(10, $payload['skills'][0]['id']);
    }

    public function testAddUserSkillMissingName(): void
    {
        $controller = $this->buildController();
        $controller->setUser($this->makeUser(1));

        $response = $controller->addUserSkill(new Request([], [], [], [], [], [], json_encode([])));
        $payload = json_decode($response->getContent(), true);

        $this->assertArrayHasKey('error', $payload);
    }

    public function testAddUserSkillSuccess(): void
    {
        $user = $this->makeUser(1);
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->method('persist')->willReturnCallback(function (object $entity) {
            if ($entity instanceof Skill) {
                $this->setId($entity, 10);
            }
        });

        $controller = new UserSkillControllerStub(
            $entityManager,
            $this->createMock(UserSkillRepository::class),
            $this->createMock(SkillRepository::class)
        );
        $controller->setUser($user);

        $request = new Request([], [], [], [], [], [], json_encode([
            'name' => 'PHP',
            'description' => 'Backend'
        ]));

        $response = $controller->addUserSkill($request);
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
        $this->assertSame('PHP', $payload['userSkill']['name']);
    }

    public function testUpdateUserSkillNotFound(): void
    {
        $repo = $this->createMock(UserSkillRepository::class);
        $repo->method('find')->with(10)->willReturn(null);

        $controller = $this->buildController($repo);
        $controller->setUser($this->makeUser(1));

        $response = $controller->updateUserSkill(10, new Request([], [], [], [], [], [], json_encode([])));
        $payload = json_decode($response->getContent(), true);

        $this->assertArrayHasKey('error', $payload);
    }

    public function testUpdateUserSkillSuccess(): void
    {
        $user = $this->makeUser(1);
        $skill = $this->makeSkill(10);
        $userSkill = new UserSkill();
        $userSkill->setUser($user)->setSkill($skill);

        $repo = $this->createMock(UserSkillRepository::class);
        $repo->method('find')->with(10)->willReturn($userSkill);

        $controller = $this->buildController($repo);
        $controller->setUser($user);

        $response = $controller->updateUserSkill(10, new Request([], [], [], [], [], [], json_encode([])));
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
        $this->assertSame(10, $payload['userSkill']['id']);
    }

    public function testDeleteUserSkillSuccess(): void
    {
        $user = $this->makeUser(1);
        $skill = $this->makeSkill(10);
        $userSkill = new UserSkill();
        $userSkill->setUser($user)->setSkill($skill);

        $repo = $this->createMock(UserSkillRepository::class);
        $repo->method('findOneBy')->willReturn($userSkill);
        $repo->method('findBy')->willReturn([$userSkill]);

        $controller = $this->buildController($repo);
        $controller->setUser($user);

        $response = $controller->deleteUserSkill(10);
        $payload = json_decode($response->getContent(), true);

        $this->assertTrue($payload['success']);
    }

    private function buildController(?UserSkillRepository $userSkillRepository = null): UserSkillControllerStub
    {
        $userSkillRepository ??= $this->createMock(UserSkillRepository::class);

        return new UserSkillControllerStub(
            $this->createMock(EntityManagerInterface::class),
            $userSkillRepository,
            $this->createMock(SkillRepository::class)
        );
    }

    private function makeUser(int $id): User
    {
        $user = new User();
        $user->setEmail('user@example.com')->setFirstname('John')->setLastname('Doe');
        $user->setCreatedAt(new \DateTimeImmutable('2024-01-01 10:00:00'));
        $user->setUpdatedAt(new \DateTimeImmutable('2024-01-02 10:00:00'));
        $this->setId($user, $id);

        return $user;
    }

    private function makeSkill(int $id): Skill
    {
        $skill = new Skill();
        $skill->setName('PHP')->setDescription('Backend');
        $skill->setCreatedAt(new \DateTimeImmutable('2024-01-01 10:00:00'));
        $this->setId($skill, $id);

        return $skill;
    }

    private function setId(object $entity, int $id): void
    {
        $reflection = new \ReflectionClass($entity);
        $prop = $reflection->getProperty('id');
        $prop->setAccessible(true);
        $prop->setValue($entity, $id);
    }
}

class UserSkillControllerStub extends UserSkillController
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

