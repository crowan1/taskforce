<?php

namespace App\Entity;

use App\Repository\DismissedAlertRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: DismissedAlertRepository::class)]
#[ORM\Table(name: 'dismissed_alert')]
#[ORM\HasLifecycleCallbacks]
class DismissedAlert
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\ManyToOne(targetEntity: Project::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?Project $project = null;

    #[ORM\Column(length: 50)]
    private ?string $alertType = null; 
    #[ORM\Column(nullable: true)]
    private ?int $alertEntityId = null;  

    #[ORM\Column]
    private ?\DateTimeImmutable $dismissedAt = null;

    public function getId(): ?int
    {
        return $this->id;
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

    public function getProject(): ?Project
    {
        return $this->project;
    }

    public function setProject(?Project $project): static
    {
        $this->project = $project;
        return $this;
    }

    public function getAlertType(): ?string
    {
        return $this->alertType;
    }

    public function setAlertType(string $alertType): static
    {
        $this->alertType = $alertType;
        return $this;
    }

    public function getAlertEntityId(): ?int
    {
        return $this->alertEntityId;
    }

    public function setAlertEntityId(?int $alertEntityId): static
    {
        $this->alertEntityId = $alertEntityId;
        return $this;
    }

    public function getDismissedAt(): ?\DateTimeImmutable
    {
        return $this->dismissedAt;
    }

    public function setDismissedAt(\DateTimeImmutable $dismissedAt): static
    {
        $this->dismissedAt = $dismissedAt;
        return $this;
    }

    #[ORM\PrePersist]
    public function setDismissedAtValue(): void
    {
        $this->dismissedAt = new \DateTimeImmutable();
    }
}
