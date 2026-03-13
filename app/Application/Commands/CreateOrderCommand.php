<?php

namespace App\Application\Commands;

use App\Application\DTOs\CreateOrderDTO;
use App\Domain\Interfaces\OrderRepositoryInterface;
use App\Domain\Entities\Order;
use DateTimeImmutable;

class CreateOrderCommand
{
    public function __construct(
        private readonly OrderRepositoryInterface $orderRepository
    ) {}

    public function execute(CreateOrderDTO $dto): Order
    {
        if (empty($dto->userId)) {
            throw new \InvalidArgumentException('User ID is required');
        }

        if ($dto->totalAmount <= 0) {
            throw new \InvalidArgumentException('Total amount must be greater than 0');
        }

        $order = new Order(
            id: $this->generateUuid(),
            userId: $dto->userId,
            totalAmount: $dto->totalAmount,
            status: $dto->status,
            createdAt: new DateTimeImmutable()
        );

        return $this->orderRepository->save($order);
    }

    private function generateUuid(): string
    {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            random_int(0, 0xffff),
            random_int(0, 0xffff),
            random_int(0, 0xffff),
            random_int(0, 0x0fff) | 0x4000,
            random_int(0, 0x3fff) | 0x8000,
            random_int(0, 0xffff),
            random_int(0, 0xffff),
            random_int(0, 0xffff)
        );
    }
}
