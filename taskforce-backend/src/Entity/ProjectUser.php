<?php

namespace App\Entity;

use App\Repository\ProjectUserRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ProjectUserRepository::class)]
#[ORM\Table(name: 'project_users')]
class ProjectUser
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Project::class, inversedBy: 'projectUsers')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Project $project = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'projectUsers')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\Column(length: 50)]
    private ?string $role = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $joinedAt = null;

    public function __construct()
    {
        $this->joinedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getProject(): ?Project
    {
        return $this->project;
    }

    public function setProject(?Project $project): static
    {
        $this->project = $project;
        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;
        return $this;
    }

    public function getRole(): ?string
    {
        return $this->role;
    }

    public function setRole(?string $role): static
    {
        $this->role = $role;
        return $this;
    }

    public function getRoleIdentifier(): ?string
    {
        return $this->role;
    }

    public function getRoleDisplayName(): ?string
    {
        return match($this->role) {
            'ROLE_COLLABORATOR' => 'Collaborateur',
            'ROLE_MANAGER' => 'Manager',
            'ROLE_PROJECT_MANAGER' => 'Responsable de Projet',
            default => $this->role
        };
    }

    public function isResponsableProjet(): bool
    {
        return $this->role === 'ROLE_PROJECT_MANAGER';
    }

    public function isManager(): bool
    {
        return $this->role === 'ROLE_MANAGER';
    }

    public function isCollaborateur(): bool
    {
        return $this->role === 'ROLE_COLLABORATOR';
    }

    public function canManageProject(): bool
    {
        return in_array($this->role, ['ROLE_PROJECT_MANAGER', 'ROLE_MANAGER']);
    }

    public function canAssignTasks(): bool
    {
        return in_array($this->role, ['ROLE_PROJECT_MANAGER', 'ROLE_MANAGER']);
    }

    public function canViewReports(): bool
    {
        return in_array($this->role, ['ROLE_PROJECT_MANAGER', 'ROLE_MANAGER']);
    }

    public function getJoinedAt(): ?\DateTimeImmutable
    {
        return $this->joinedAt;
    }

    public function setJoinedAt(\DateTimeImmutable $joinedAt): static
    {
        $this->joinedAt = $joinedAt;
        return $this;
    }
}

