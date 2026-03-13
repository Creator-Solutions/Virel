<?php

namespace App\Application\DTOs;

class CreateOrderDTO
{
    public function __construct(
        public readonly string $userId,
        public readonly float $totalAmount,
        public readonly string $status = 'pending'
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            userId: $data['user_id'] ?? '',
            totalAmount: (float) ($data['total_amount'] ?? 0),
            status: $data['status'] ?? 'pending'
        );
    }

    public function toArray(): array
    {
        return [
            'user_id' => $this->userId,
            'total_amount' => $this->totalAmount,
            'status' => $this->status
        ];
    }
}
