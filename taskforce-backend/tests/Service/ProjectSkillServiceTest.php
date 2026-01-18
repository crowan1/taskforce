<?php

namespace App\Tests\Service;

use App\Entity\Project;
use App\Entity\ProjectSkill;
use App\Entity\ProjectUser;
use App\Entity\Skill;
use App\Entity\User;
use App\Entity\UserSkill;
use App\Service\ProjectSkillService;
use App\Repository\ProjectSkillRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;
use PHPUnit\Framework\TestCase;

class ProjectSkillServiceTest extends TestCase
{
    public function testGetProjectUserSkills(): void
    {
        $project = new Project();
        $user = new User();
        $user->setEmail('user@example.com')->setFirstname('John')->setLastname('Doe');

        $skill = new Skill();
        $skill->setName('PHP');
        $this->setId($skill, 10);

        $userSkill = new UserSkill();
        $userSkill->setUser($user)->setSkill($skill);

        $projectUser = new ProjectUser();
        $projectUser->setProject($project)->setUser($user);

        $projectUserRepo = $this->createMock(EntityRepository::class);
        $projectUserRepo->method('findBy')->willReturn([$projectUser]);

        $userSkillRepo = $this->createMock(EntityRepository::class);
        $userSkillRepo->method('findBy')->willReturn([$userSkill]);

        $entityManager = $this->createEntityManager([
            'App\Entity\ProjectUser' => $projectUserRepo,
            UserSkill::class => $userSkillRepo
        ]);

        $service = new ProjectSkillService($entityManager);
        $skills = $service->getProjectUserSkills($project);

        $this->assertCount(1, $skills);
        $this->assertSame(10, $skills[0]['id']);
    }

    public function testGetProjectSpecificSkills(): void
    {
        $project = new Project();
        $user = new User();
        $user->setEmail('user@example.com')->setFirstname('John')->setLastname('Doe');

        $projectSkill = new ProjectSkill();
        $projectSkill->setProject($project)->setCreatedBy($user)->setName('Design');
        $this->setId($projectSkill, 12);

        $projectSkillRepo = $this->createMock(ProjectSkillRepository::class);
        $projectSkillRepo->method('findByProject')->willReturn([$projectSkill]);

        $entityManager = $this->createEntityManager([
            ProjectSkill::class => $projectSkillRepo
        ]);

        $service = new ProjectSkillService($entityManager);
        $skills = $service->getProjectSpecificSkills($project);

        $this->assertCount(1, $skills);
        $this->assertSame('project_12', $skills[0]['id']);
    }

    public function testCreateAndDeleteProjectSkill(): void
    {
        $project = new Project();
        $user = new User();
        $user->setEmail('user@example.com')->setFirstname('John')->setLastname('Doe');

        $entityManager = $this->createMock(EntityManagerInterface::class);
        $service = new ProjectSkillService($entityManager);

        $projectSkill = $service->createProjectSkill($project, $user, 'UX', 'Desc');
        $this->assertSame('UX', $projectSkill->getName());

        $this->assertTrue($service->deleteProjectSkill($projectSkill));
    }

    public function testHasProjectUsers(): void
    {
        $project = new Project();

        $projectUserRepo = $this->createMock(EntityRepository::class);
        $projectUserRepo->method('findBy')->willReturn([new ProjectUser()]);

        $entityManager = $this->createEntityManager([
            'App\Entity\ProjectUser' => $projectUserRepo
        ]);

        $service = new ProjectSkillService($entityManager);
        $this->assertTrue($service->hasProjectUsers($project));
    }

    public function testGetAllAvailableProjectSkills(): void
    {
        $project = new Project();
        $user = new User();
        $user->setEmail('user@example.com')->setFirstname('John')->setLastname('Doe');

        $skill = new Skill();
        $skill->setName('PHP');
        $this->setId($skill, 10);

        $userSkill = new UserSkill();
        $userSkill->setUser($user)->setSkill($skill);

        $projectUser = new ProjectUser();
        $projectUser->setProject($project)->setUser($user);

        $projectUserRepo = $this->createMock(EntityRepository::class);
        $projectUserRepo->method('findBy')->willReturn([$projectUser]);

        $userSkillRepo = $this->createMock(EntityRepository::class);
        $userSkillRepo->method('findBy')->willReturn([$userSkill]);

        $projectSkillRepo = $this->createMock(ProjectSkillRepository::class);
        $projectSkillRepo->method('findByProject')->willReturn([]);

        $entityManager = $this->createEntityManager([
            'App\Entity\ProjectUser' => $projectUserRepo,
            UserSkill::class => $userSkillRepo,
            ProjectSkill::class => $projectSkillRepo
        ]);

        $service = new ProjectSkillService($entityManager);
        $skills = $service->getAllAvailableProjectSkills($project);

        $this->assertCount(1, $skills);
    }

    private function createEntityManager(array $repositories): EntityManagerInterface
    {
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->method('getRepository')->willReturnCallback(function ($class) use ($repositories) {
            return $repositories[$class] ?? $this->createMock(EntityRepository::class);
        });

        return $entityManager;
    }

    private function setId(object $entity, int $id): void
    {
        $reflection = new \ReflectionClass($entity);
        $prop = $reflection->getProperty('id');
        $prop->setAccessible(true);
        $prop->setValue($entity, $id);
    }
}

