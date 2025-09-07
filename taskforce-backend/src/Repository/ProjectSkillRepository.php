<?php

namespace App\Repository;

use App\Entity\ProjectSkill;
use App\Entity\Project;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ProjectSkill>
 */
class ProjectSkillRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ProjectSkill::class);
    }
 
    public function findByProject(Project $project): array
    {
        return $this->createQueryBuilder('ps')
            ->where('ps.project = :project')
            ->setParameter('project', $project)
            ->orderBy('ps.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    
    public function existsForProject(Project $project, string $name): bool
    {
        $result = $this->createQueryBuilder('ps')
            ->select('COUNT(ps.id)')
            ->where('ps.project = :project')
            ->andWhere('LOWER(ps.name) = LOWER(:name)')
            ->setParameter('project', $project)
            ->setParameter('name', $name)
            ->getQuery()
            ->getSingleScalarResult();

        return $result > 0;
    }
}

