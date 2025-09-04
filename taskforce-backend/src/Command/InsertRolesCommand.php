<?php

namespace App\Command;

use App\Entity\Role;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:insert-roles',
    description: 'Ce fichier sert a insèrer les rôles ( Manager, Responsable de Projet, Collaborateur) dans la base de données pour initier le projet (si pas fait, ca marchera pas)'
)]
class InsertRolesCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $io->title('Insertion des rôles de base');

        try {
            $roleRepository = $this->entityManager->getRepository(Role::class);

            $roles = [
                ['collaborateur', 'Collaborateur', 'Membre de l\'équipe du projet'],
                ['manager', 'Manager', 'Superviseur du projet'],
                ['responsable_projet', 'Responsable de Projet', 'Responsable principal du projet']
            ];

            foreach ($roles as $roleData) {
                $existingRole = $roleRepository->findByIdentifier($roleData[0]);
                if (!$existingRole) {
                    $role = new Role();
                    $role->setIdentifier($roleData[0]);
                    $role->setDisplayName($roleData[1]);
                    $role->setDescription($roleData[2]);

                    $this->entityManager->persist($role);
                    $io->text("✅ Rôle {$roleData[1]} ajouté");
                } else {
                    $io->text("ℹ️ Rôle {$roleData[1]} existe déjà");
                }
            }

            $this->entityManager->flush();
            $io->success('Rôles de base insérés avec succès');

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $io->error('Erreur lors de l\'insertion des rôles: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}

