<?php

namespace App\Repository;

use App\Entity\Column;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class ColumnRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Column::class);
    }

    public function findByProject(int $projectId): array
    {
        return $this->createQueryBuilder('c')
            ->andWhere('IDENTITY(c.project) = :projectId')
            ->andWhere('c.isActive = :isActive')
            ->setParameter('projectId', $projectId)
            ->setParameter('isActive', true)
            ->orderBy('c.position', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function save(Column $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Column $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
}
