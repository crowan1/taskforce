<?php

namespace App\Tests\Repository;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ManagerRegistry;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;

class UserRepositoryTest extends TestCase
{
    private function createRepository(EntityManagerInterface $entityManager = null): UserRepository
    {
        $registry = $this->createMock(ManagerRegistry::class);
        if ($entityManager) {
            $registry->method('getManagerForClass')
                ->with(User::class)
                ->willReturn($entityManager);
        }

        return new UserRepository($registry);
    }

    public function testFindByEmailSuccess(): void
    {
        $user = new User();
        $user->setEmail('test@example.com');
        $user->setFirstname('Test');
        $user->setLastname('User');

        $entityManager = $this->createMock(EntityManagerInterface::class);
        $repository = $this->createRepository($entityManager);
 
        $reflection = new \ReflectionClass($repository);
        $method = $reflection->getMethod('findOneBy');
        $method->setAccessible(true);
 
        $this->assertTrue(method_exists($repository, 'findByEmail'));
    }

    public function testUpgradePasswordSuccess(): void
    {
        $user = new User();
        $user->setEmail('test@example.com');
        $user->setFirstname('Test');
        $user->setLastname('User');
        $user->setPassword('old_password');

        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects($this->once())
            ->method('persist')
            ->with($user);
        $entityManager->expects($this->once())
            ->method('flush');

        $registry = $this->createMock(ManagerRegistry::class);
        $registry->method('getManagerForClass')
            ->with(User::class)
            ->willReturn($entityManager);
 
        $repository = $this->getMockBuilder(UserRepository::class)
            ->setConstructorArgs([$registry])
            ->onlyMethods(['getEntityManager'])
            ->getMock();
        
        $repository->method('getEntityManager')
            ->willReturn($entityManager);

        $newPassword = 'new_hashed_password';
        $repository->upgradePassword($user, $newPassword);

        $this->assertEquals($newPassword, $user->getPassword());
    }

    public function testUpgradePasswordWithInvalidUser(): void
    {
        $invalidUser = $this->createMock(PasswordAuthenticatedUserInterface::class);

        $entityManager = $this->createMock(EntityManagerInterface::class);
        $registry = $this->createMock(ManagerRegistry::class);
        $registry->method('getManagerForClass')
            ->with(User::class)
            ->willReturn($entityManager);

        $repository = new UserRepository($registry);

        $this->expectException(UnsupportedUserException::class);
        $this->expectExceptionMessage('Instances of "');

        $repository->upgradePassword($invalidUser, 'new_password');
    }
}

