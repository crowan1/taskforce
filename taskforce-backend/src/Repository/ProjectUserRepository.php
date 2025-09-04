<?php

namespace App\Repository;

use App\Entity\ProjectUser;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class ProjectUserRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ProjectUser::class);
    }

    public function findByProject(int $projectId): array
    {
        return $this->createQueryBuilder('pu')
            ->leftJoin('pu.user', 'u')
            ->leftJoin('pu.role', 'r')
            ->addSelect('u')
            ->addSelect('r')
            ->andWhere('pu.project = :projectId')
            ->setParameter('projectId', $projectId)
            ->orderBy('r.identifier', 'DESC')
            ->addOrderBy('u.firstname', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findByUserAndProject(int $userId, int $projectId): ?ProjectUser
    {
        return $this->createQueryBuilder('pu')
            ->andWhere('pu.user = :userId AND pu.project = :projectId')
            ->setParameter('userId', $userId)
            ->setParameter('projectId', $projectId)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findResponsablesByProject(int $projectId): array
    {
        return $this->createQueryBuilder('pu')
            ->leftJoin('pu.user', 'u')
            ->leftJoin('pu.role', 'r')
            ->addSelect('u')
            ->addSelect('r')
            ->andWhere('pu.project = :projectId AND r.identifier = :role')
            ->setParameter('projectId', $projectId)
            ->setParameter('role', 'responsable_projet')
            ->getQuery()
            ->getResult();
    }

    public function findManagersByProject(int $projectId): array
    {
        return $this->createQueryBuilder('pu')
            ->leftJoin('pu.user', 'u')
            ->leftJoin('pu.role', 'r')
            ->addSelect('u')
            ->addSelect('r')
            ->andWhere('pu.project = :projectId AND r.identifier = :role')
            ->setParameter('projectId', $projectId)
            ->setParameter('role', 'manager')
            ->getQuery()
            ->getResult();
    }

    public function findCollaborateursByProject(int $projectId): array
    {
        return $this->createQueryBuilder('pu')
            ->leftJoin('pu.user', 'u')
            ->leftJoin('pu.role', 'r')
            ->addSelect('u')
            ->addSelect('r')
            ->andWhere('pu.project = :projectId AND r.identifier = :role')
            ->setParameter('projectId', $projectId)
            ->setParameter('role', 'collaborateur')
            ->getQuery()
            ->getResult();
    }

    public function save(ProjectUser $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(ProjectUser $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
}

