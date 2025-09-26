<?php

namespace App\Repository;

use App\Entity\DismissedAlert;
use App\Entity\User;
use App\Entity\Project;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<DismissedAlert>
 */
class DismissedAlertRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, DismissedAlert::class);
    }

    /**
     * Récupère toutes les alertes supprimées par un utilisateur pour un projet
     */
    public function findDismissedAlerts(User $user, Project $project): array
    {
        return $this->createQueryBuilder('da')
            ->andWhere('da.user = :user')
            ->andWhere('da.project = :project')
            ->setParameter('user', $user)
            ->setParameter('project', $project)
            ->getQuery()
            ->getResult();
    }

    /**
     * Vérifie si une alerte spécifique a été supprimée
     */
    public function isAlertDismissed(User $user, Project $project, string $alertType, ?int $entityId = null): bool
    {
        $qb = $this->createQueryBuilder('da')
            ->select('COUNT(da.id)')
            ->andWhere('da.user = :user')
            ->andWhere('da.project = :project')
            ->andWhere('da.alertType = :alertType')
            ->setParameter('user', $user)
            ->setParameter('project', $project)
            ->setParameter('alertType', $alertType);

        if ($entityId !== null) {
            $qb->andWhere('da.alertEntityId = :entityId')
               ->setParameter('entityId', $entityId);
        }

        return $qb->getQuery()->getSingleScalarResult() > 0;
    }

    /**
     * Supprime une alerte spécifique (pour la "restaurer")
     */
    public function removeDismissedAlert(User $user, Project $project, string $alertType, ?int $entityId = null): void
    {
        $qb = $this->createQueryBuilder('da')
            ->delete()
            ->andWhere('da.user = :user')
            ->andWhere('da.project = :project')
            ->andWhere('da.alertType = :alertType')
            ->setParameter('user', $user)
            ->setParameter('project', $project)
            ->setParameter('alertType', $alertType);

        if ($entityId !== null) {
            $qb->andWhere('da.alertEntityId = :entityId')
               ->setParameter('entityId', $entityId);
        }

        $qb->getQuery()->execute();
    }
}
