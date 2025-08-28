<?php

namespace App\Entity;

use App\Repository\TaskRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use App\Entity\Project;
use App\Entity\Column;
use App\Entity\Skill;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

#[ORM\Entity(repositoryClass: TaskRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Task
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank(message: 'Le titre ne peut pas être vide')]
    private ?string $title = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $description = null;

    #[ORM\Column(length: 20)]
    private ?string $status = 'backlog';

    #[ORM\Column(length: 20)]
    private ?string $priority = 'medium';

    #[ORM\Column(length: 20)]
    private ?string $level = 'intermediate';

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true)]
    private ?User $assignedTo = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $assignedAt = null;

    #[ORM\Column(type: 'float', nullable: true)]
    private ?float $assignmentScore = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $createdBy = null;

    #[ORM\ManyToOne(targetEntity: Project::class, inversedBy: 'tasks')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Project $project = null;

    #[ORM\ManyToOne(targetEntity: Column::class, inversedBy: 'tasks')]
    #[ORM\JoinColumn(nullable: true)]
    private ?Column $column = null;

    #[ORM\ManyToMany(targetEntity: Skill::class, inversedBy: 'tasks')]
    #[ORM\JoinTable(name: 'task_required_skills')]
    private Collection $requiredSkills;



    public function __construct()
    {
        $this->status = 'backlog';
        $this->priority = 'medium';
        $this->level = 'intermediate';
        $this->requiredSkills = new ArrayCollection();
    }

    #[ORM\PrePersist]
    public function setCreatedAtValue(): void
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    #[ORM\PreUpdate]
    public function setUpdatedAtValue(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;
        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;
        return $this;
    }

    public function getPriority(): ?string
    {
        return $this->priority;
    }

    public function setPriority(string $priority): static
    {
        $this->priority = $priority;
        return $this;
    }



    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    public function getAssignedTo(): ?User
    {
        return $this->assignedTo;
    }

    public function setAssignedTo(?User $assignedTo): static
    {
        $this->assignedTo = $assignedTo;
        if ($assignedTo) {
            $this->assignedAt = new \DateTimeImmutable();
        }
        return $this;
    }

    public function getAssignedAt(): ?\DateTimeImmutable
    {
        return $this->assignedAt;
    }

    public function setAssignedAt(?\DateTimeImmutable $assignedAt): static
    {
        $this->assignedAt = $assignedAt;
        return $this;
    }

    public function getAssignmentScore(): ?float
    {
        return $this->assignmentScore;
    }

    public function setAssignmentScore(?float $assignmentScore): static
    {
        $this->assignmentScore = $assignmentScore;
        return $this;
    }

    public function getCreatedBy(): ?User
    {
        return $this->createdBy;
    }

    public function setCreatedBy(?User $createdBy): static
    {
        $this->createdBy = $createdBy;
        return $this;
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

    public function getColumn(): ?Column
    {
        return $this->column;
    }

    public function setColumn(?Column $column): static
    {
        $this->column = $column;
        return $this;
    }

    /**
     * @return Collection<int, Skill>
     */
    public function getRequiredSkills(): Collection
    {
        return $this->requiredSkills;
    }

    public function addRequiredSkill(Skill $skill): static
    {
        if (!$this->requiredSkills->contains($skill)) {
            $this->requiredSkills->add($skill);
        }

        return $this;
    }

    public function removeRequiredSkill(Skill $skill): static
    {
        $this->requiredSkills->removeElement($skill);

        return $this;
    }
}
