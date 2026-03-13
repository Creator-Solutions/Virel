<?php

namespace App\Domain\Entities;

use App\Domain\ValueObjects\Email;
use DateTimeImmutable;

class User
{
    private string $id;
    private string $name;
    private Email $email;
    private DateTimeImmutable $createdAt;
    private ?DateTimeImmutable $updatedAt;

    public function __construct(
        string $id,
        string $name,
        Email $email,
        DateTimeImmutable $createdAt,
        ?DateTimeImmutable $updatedAt = null
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->email = $email;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getEmail(): Email
    {
        return $this->email;
    }

    public function getCreatedAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function changeName(string $newName): void
    {
        if (trim($newName) === '') {
            throw new \InvalidArgumentException('Name cannot be empty');
        }
        $this->name = $newName;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function changeEmail(Email $newEmail): void
    {
        $this->email = $newEmail;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function isActive(): bool
    {
        return true;
    }
}
