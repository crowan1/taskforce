<?php

namespace App\Repository;

use App\Entity\UserSkill;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class UserSkillRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, UserSkill::class);
    }

    public function findByUser(int $userId): array
    {
        return $this->createQueryBuilder('us')
            ->leftJoin('us.skill', 's')
            ->addSelect('s')
            ->andWhere('us.user = :userId')
            ->setParameter('userId', $userId)
            ->orderBy('s.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findByUserAndSkill(int $userId, int $skillId): ?UserSkill
    {
        return $this->createQueryBuilder('us')
            ->andWhere('us.user = :userId')
            ->andWhere('us.skill = :skillId')
            ->setParameter('userId', $userId)
            ->setParameter('skillId', $skillId)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function save(UserSkill $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(UserSkill $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
}
