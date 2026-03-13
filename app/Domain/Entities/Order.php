<?php

namespace App\Domain\Entities;

use DateTimeImmutable;

class Order
{
    private string $id;
    private string $userId;
    private float $totalAmount;
    private string $status;
    private DateTimeImmutable $createdAt;
    private ?DateTimeImmutable $updatedAt;

    public const STATUS_PENDING = 'pending';
    public const STATUS_PROCESSING = 'processing';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';

    public function __construct(
        string $id,
        string $userId,
        float $totalAmount,
        string $status = self::STATUS_PENDING,
        DateTimeImmutable $createdAt = new DateTimeImmutable(),
        ?DateTimeImmutable $updatedAt = null
    ) {
        $this->id = $id;
        $this->userId = $userId;
        $this->totalAmount = $totalAmount;
        $this->status = $status;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getUserId(): string
    {
        return $this->userId;
    }

    public function getTotalAmount(): float
    {
        return $this->totalAmount;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function getCreatedAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function process(): void
    {
        if ($this->status !== self::STATUS_PENDING) {
            throw new \InvalidArgumentException('Only pending orders can be processed');
        }
        $this->status = self::STATUS_PROCESSING;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function complete(): void
    {
        if ($this->status !== self::STATUS_PROCESSING) {
            throw new \InvalidArgumentException('Only processing orders can be completed');
        }
        $this->status = self::STATUS_COMPLETED;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function cancel(): void
    {
        if ($this->status === self::STATUS_COMPLETED) {
            throw new \InvalidArgumentException('Completed orders cannot be cancelled');
        }
        $this->status = self::STATUS_CANCELLED;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    public function isCancelled(): bool
    {
        return $this->status === self::STATUS_CANCELLED;
    }
}
