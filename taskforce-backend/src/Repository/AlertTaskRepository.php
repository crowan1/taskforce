<?php

namespace App\Repository;

use App\Entity\AlertTask;
use App\Entity\Project;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class AlertTaskRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, AlertTask::class);
    }

    public function isAlertStored(Project $project, string $alertType, ?int $entityId = null): bool
    {
        $qb = $this->createQueryBuilder('a')
            ->select('COUNT(a.id)')
            ->andWhere('a.project = :project')
            ->andWhere('a.alertType = :type')
            ->setParameter('project', $project)
            ->setParameter('type', $alertType);

        if ($entityId !== null) {
            $qb->andWhere('a.alertEntityId = :eid')->setParameter('eid', $entityId);
        }

        return (int)$qb->getQuery()->getSingleScalarResult() > 0;
    }

    public function storeOverdueAlert(User $user, Project $project, int $taskId): void
    {
        if ($this->isAlertStored($project, 'overdue_task', $taskId)) {
            return;
        }
        $alert = new AlertTask();
        $alert->setUser($user);
        $alert->setProject($project);
        $alert->setAlertType('overdue_task');
        $alert->setAlertEntityId($taskId);
        $this->_em->persist($alert);
        $this->_em->flush();
    }

    public function deleteOverdueAlert(Project $project, int $taskId): void
    {
        $this->createQueryBuilder('a')
            ->delete()
            ->andWhere('a.project = :project')
            ->andWhere('a.alertType = :type')
            ->andWhere('a.alertEntityId = :eid')
            ->setParameter('project', $project)
            ->setParameter('type', 'overdue_task')
            ->setParameter('eid', $taskId)
            ->getQuery()
            ->execute();
    }

    /**
     * Return all stored overdue task alerts for a given project.
     *
     * @return AlertTask[]
     */
    public function findOverdueAlertsForProject(Project $project): array
    {
        return $this->createQueryBuilder('a')
            ->andWhere('a.project = :project')
            ->andWhere('a.alertType = :type')
            ->setParameter('project', $project)
            ->setParameter('type', 'overdue_task')
            ->orderBy('a.id', 'DESC')
            ->getQuery()
            ->getResult();
    }
}


