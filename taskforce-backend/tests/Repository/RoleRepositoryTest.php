<?php

namespace App\Tests\Repository;

use App\Entity\Role;
use App\Repository\RoleRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ManagerRegistry;
use PHPUnit\Framework\TestCase;

class RoleRepositoryTest extends TestCase
{
    public function testFindByIdentifierSuccess(): void
    {
        $role = new Role();
        $role->setIdentifier('test_role');
        $role->setDisplayName('Test Role');

        $entityManager = $this->createMock(EntityManagerInterface::class);
        $registry = $this->createMock(ManagerRegistry::class);
        $registry->method('getManagerForClass')
            ->with(Role::class)
            ->willReturn($entityManager);

        $repository = $this->getMockBuilder(RoleRepository::class)
            ->setConstructorArgs([$registry])
            ->onlyMethods(['findOneBy'])
            ->getMock();

        $repository->method('findOneBy')
            ->with(['identifier' => 'test_role'])
            ->willReturn($role);

        $result = $repository->findByIdentifier('test_role');

        $this->assertInstanceOf(Role::class, $result);
        $this->assertEquals('test_role', $result->getIdentifier());
    }

    public function testFindByIdentifierNotFound(): void
    {
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $registry = $this->createMock(ManagerRegistry::class);
        $registry->method('getManagerForClass')
            ->with(Role::class)
            ->willReturn($entityManager);

        $repository = $this->getMockBuilder(RoleRepository::class)
            ->setConstructorArgs([$registry])
            ->onlyMethods(['findOneBy'])
            ->getMock();

        $repository->method('findOneBy')
            ->with(['identifier' => 'non_existent'])
            ->willReturn(null);

        $result = $repository->findByIdentifier('non_existent');

        $this->assertNull($result);
    }

    public function testSaveWithFlush(): void
    {
        $role = new Role();
        $role->setIdentifier('test_role');
        $role->setDisplayName('Test Role');

        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects($this->once())
            ->method('persist')
            ->with($role);
        $entityManager->expects($this->once())
            ->method('flush');

        $registry = $this->createMock(ManagerRegistry::class);
        $registry->method('getManagerForClass')
            ->with(Role::class)
            ->willReturn($entityManager);

        $repository = $this->getMockBuilder(RoleRepository::class)
            ->setConstructorArgs([$registry])
            ->onlyMethods(['getEntityManager'])
            ->getMock();

        $repository->method('getEntityManager')
            ->willReturn($entityManager);

        $repository->save($role, true);
    }

    public function testSaveWithoutFlush(): void
    {
        $role = new Role();
        $role->setIdentifier('test_role');
        $role->setDisplayName('Test Role');

        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects($this->once())
            ->method('persist')
            ->with($role);
        $entityManager->expects($this->never())
            ->method('flush');

        $registry = $this->createMock(ManagerRegistry::class);
        $registry->method('getManagerForClass')
            ->with(Role::class)
            ->willReturn($entityManager);

        $repository = $this->getMockBuilder(RoleRepository::class)
            ->setConstructorArgs([$registry])
            ->onlyMethods(['getEntityManager'])
            ->getMock();

        $repository->method('getEntityManager')
            ->willReturn($entityManager);

        $repository->save($role, false);
    }

    public function testRemoveWithFlush(): void
    {
        $role = new Role();
        $role->setIdentifier('test_role');
        $role->setDisplayName('Test Role');

        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects($this->once())
            ->method('remove')
            ->with($role);
        $entityManager->expects($this->once())
            ->method('flush');

        $registry = $this->createMock(ManagerRegistry::class);
        $registry->method('getManagerForClass')
            ->with(Role::class)
            ->willReturn($entityManager);

        $repository = $this->getMockBuilder(RoleRepository::class)
            ->setConstructorArgs([$registry])
            ->onlyMethods(['getEntityManager'])
            ->getMock();

        $repository->method('getEntityManager')
            ->willReturn($entityManager);

        $repository->remove($role, true);
    }
}

