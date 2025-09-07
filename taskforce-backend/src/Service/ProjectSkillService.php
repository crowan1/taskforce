<?php

namespace App\Service;

use App\Entity\Project;
use App\Entity\User;
use App\Entity\Skill;
use App\Entity\UserSkill;
use App\Entity\ProjectSkill;
use Doctrine\ORM\EntityManagerInterface;

class ProjectSkillService
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {}

    public function getProjectUserSkills(Project $project): array
    {
        $projectUsers = $this->entityManager->getRepository('App\Entity\ProjectUser')
            ->findBy(['project' => $project]);

        $skills = [];
        foreach ($projectUsers as $projectUser) {
            $user = $projectUser->getUser();
            $userSkills = $this->entityManager->getRepository(UserSkill::class)
                ->findBy(['user' => $user]);

            foreach ($userSkills as $userSkill) {
                $skill = $userSkill->getSkill();
                $skillId = $skill->getId();
                 
                if (!isset($skills[$skillId])) {
                    $skills[$skillId] = [
                        'id' => $skill->getId(),
                        'name' => $skill->getName(),
                        'category' => null,
                        'type' => 'user_skill'
                    ];
                }
            }
        }

        return array_values($skills);
    }

 
    public function getProjectSpecificSkills(Project $project): array
    {
        $projectSkills = $this->entityManager->getRepository(ProjectSkill::class)
            ->findByProject($project);

        $skills = [];
        foreach ($projectSkills as $projectSkill) {
            $skills[] = [
                'id' => 'project_' . $projectSkill->getId(),
                'name' => $projectSkill->getName(),
                'description' => $projectSkill->getDescription(),
                'type' => 'project_skill',
                'createdBy' => [
                    'id' => $projectSkill->getCreatedBy()->getId(),
                    'firstname' => $projectSkill->getCreatedBy()->getFirstname(),
                    'lastname' => $projectSkill->getCreatedBy()->getLastname()
                ]
            ];
        }

        return $skills;
    }

  
    public function getAllAvailableProjectSkills(Project $project): array
    {
        $userSkills = $this->getProjectUserSkills($project);
        $projectSkills = $this->getProjectSpecificSkills($project);

        return array_merge($userSkills, $projectSkills);
    }
 
    public function createProjectSkill(Project $project, User $user, string $name, ?string $description = null): ProjectSkill
    {
        $projectSkill = new ProjectSkill();
        $projectSkill->setProject($project);
        $projectSkill->setCreatedBy($user);
        $projectSkill->setName($name);
        $projectSkill->setDescription($description);

        $this->entityManager->persist($projectSkill);
        $this->entityManager->flush();

        return $projectSkill;
    }
 
    public function deleteProjectSkill(ProjectSkill $projectSkill): bool
    {
        $this->entityManager->remove($projectSkill);
        $this->entityManager->flush();

        return true;
    }

    
    public function hasProjectUsers(Project $project): bool
    {
        $projectUsers = $this->entityManager->getRepository('App\Entity\ProjectUser')
            ->findBy(['project' => $project]);

        return count($projectUsers) > 0;
    }
}
