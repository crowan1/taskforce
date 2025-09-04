<?php

namespace App\Controller;

use App\Entity\UserSkill;
use App\Entity\Skill;
use App\Entity\User;
use App\Repository\UserSkillRepository;
use App\Repository\SkillRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/user-skills')]
class UserSkillController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserSkillRepository $userSkillRepository,
        private SkillRepository $skillRepository
    ) {}

    #[Route('', name: 'get_user_skills', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getUserSkills(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non connecté'], 401);
        }
        /** @var User $user */
        $userSkills = $this->userSkillRepository->findByUser($user->getId());

        $skills = array_map(function($userSkill) {
            return [
                'id' => $userSkill->getSkill()->getId(),
                'name' => $userSkill->getSkill()->getName(),
                'description' => $userSkill->getSkill()->getDescription()
            ];
        }, $userSkills);

        return $this->json([
            'success' => true,
            'skills' => $skills
        ]);
    }

    #[Route('/user/{userId}', name: 'get_user_skills_by_id', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getUserSkillsByUserId(int $userId): JsonResponse
    {
        $currentUser = $this->getUser();
        if (!$currentUser) {
            return $this->json(['error' => 'Utilisateur non connecté'], 401);
        }
        $userSkills = $this->userSkillRepository->findByUser($userId);

        $skills = array_map(function($userSkill) {
            return [
                'id' => $userSkill->getSkill()->getId(),
                'name' => $userSkill->getSkill()->getName(),
                'description' => $userSkill->getSkill()->getDescription()
            ];
        }, $userSkills);

        return $this->json([
            'success' => true,
            'skills' => $skills
        ]);
    }

    #[Route('', name: 'add_user_skill', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function addUserSkill(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non connecté'], 401);
        }
        /** @var User $user */
        $data = json_decode($request->getContent(), true);

        $skillName = $data['name'] ?? null;
        $skillDescription = $data['description'] ?? null;

        if (!$skillName) {
            return $this->json(['error' => 'Nom de compétence requis'], 400);
        }

        $skill = new Skill();
        $skill->setName($skillName);
        $skill->setDescription($skillDescription);
        $skill->setCreatedBy($user);

        $this->entityManager->persist($skill);
        $this->entityManager->flush();

        $userSkill = new UserSkill();
        $userSkill->setUser($user);
        $userSkill->setSkill($skill);

        $this->entityManager->persist($userSkill);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'message' => 'Compétence créée et ajoutée avec succès',
            'userSkill' => [
                'id' => $skill->getId(),
                'name' => $skill->getName(),
                'description' => $skill->getDescription()
            ]
        ]);
    }

    #[Route('/{id}', name: 'update_user_skill', methods: ['PUT'])]
    #[IsGranted('ROLE_USER')]
    public function updateUserSkill(int $id, Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non connecté'], 401);
        }
        /** @var User $user */
        $data = json_decode($request->getContent(), true);

        $userSkill = $this->userSkillRepository->find($id);
        $currentUserId = $user->getId();
        if (!$userSkill || !$currentUserId || $userSkill->getUser()->getId() !== $currentUserId) {
            return $this->json(['error' => 'Compétence non trouvée'], 404);
        }


        $userSkill->setUpdatedAt(new \DateTimeImmutable());

        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'message' => 'Compétence mise à jour avec succès',
            'userSkill' => [
                'id' => $userSkill->getSkill()->getId(),
                'name' => $userSkill->getSkill()->getName(),
                'description' => $userSkill->getSkill()->getDescription()
            ]
        ]);
    }

    #[Route('/skill/{skillId}', name: 'delete_user_skill', methods: ['DELETE'])]
    #[IsGranted('ROLE_USER')]
    public function deleteUserSkill(int $skillId): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non connecté'], 401);
        }
        
        $userId = $user->getId();
        if (!$userId) {
            return $this->json(['error' => 'ID utilisateur invalide'], 400);
        }
        
        $userSkill = $this->userSkillRepository->findOneBy([
            'user' => $userId,
            'skill' => $skillId
        ]);

        if (!$userSkill) {
            return $this->json(['error' => 'Compétence non trouvée'], 404);
        }

        $this->entityManager->remove($userSkill);
         
        $skill = $userSkill->getSkill();
        $otherUserSkills = $this->userSkillRepository->findBy(['skill' => $skillId]);
        if (count($otherUserSkills) <= 1) {  
            $this->entityManager->remove($skill);
        }
        
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'message' => 'Compétence supprimée avec succès'
        ]);
    }
}
