<?php

namespace App\Tests\Command;

use App\Command\InsertRolesCommand;
use App\Entity\Role;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

class InsertRolesCommandTest extends TestCase
{
    public function testExecuteSuccessWithNewRoles(): void
    {
        $roleRepository = $this->createMock(\App\Repository\RoleRepository::class);
        $roleRepository->method('findByIdentifier')
            ->willReturn(null);  

        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->method('getRepository')
            ->with(Role::class)
            ->willReturn($roleRepository);
        $entityManager->expects($this->exactly(3))
            ->method('persist')
            ->with($this->isInstanceOf(Role::class));
        $entityManager->expects($this->once())
            ->method('flush');

        $command = new InsertRolesCommand($entityManager);

        $input = $this->createMock(InputInterface::class);
        $output = $this->createMock(OutputInterface::class);

        $result = $command->run($input, $output);

        $this->assertEquals(0, $result);
    }

    public function testExecuteSuccessWithExistingRoles(): void
    {
        $existingRole1 = new Role();
        $existingRole1->setIdentifier('collaborateur');
        $existingRole2 = new Role();
        $existingRole2->setIdentifier('manager');

        $roleRepository = $this->createMock(\App\Repository\RoleRepository::class);
        $roleRepository->method('findByIdentifier')
            ->willReturnCallback(function ($identifier) use ($existingRole1, $existingRole2) {
                if ($identifier === 'collaborateur') {
                    return $existingRole1;
                }
                if ($identifier === 'manager') {
                    return $existingRole2;
                }
                return null;  
            });

        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->method('getRepository')
            ->with(Role::class)
            ->willReturn($roleRepository);
        $entityManager->expects($this->once())
            ->method('persist')
            ->with($this->isInstanceOf(Role::class));
        $entityManager->expects($this->once())
            ->method('flush');

        $command = new InsertRolesCommand($entityManager);

        $input = $this->createMock(InputInterface::class);
        $output = $this->createMock(OutputInterface::class);

        $result = $command->run($input, $output);

        $this->assertEquals(0, $result);
    }

    public function testExecuteFailureWithException(): void
    {
        $roleRepository = $this->createMock(\App\Repository\RoleRepository::class);
        $roleRepository->method('findByIdentifier')
            ->willThrowException(new \RuntimeException('Database error'));

        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->method('getRepository')
            ->with(Role::class)
            ->willReturn($roleRepository);

        $command = new InsertRolesCommand($entityManager);

        $input = $this->createMock(InputInterface::class);
        $output = $this->createMock(OutputInterface::class);

        $result = $command->run($input, $output);

        $this->assertEquals(1, $result);
    }
}

