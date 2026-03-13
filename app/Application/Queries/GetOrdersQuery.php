<?php

namespace App\Application\Queries;

use App\Domain\Interfaces\OrderRepositoryInterface;
use App\Domain\Entities\Order;

class GetOrdersQuery
{
    public function __construct(
        private readonly OrderRepositoryInterface $orderRepository
    ) {}

    public function execute(): array
    {
        return $this->orderRepository->findAll();
    }

    public function executeById(string $id): ?Order
    {
        return $this->orderRepository->findById($id);
    }

    public function executeByUserId(string $userId): array
    {
        return $this->orderRepository->findByUserId($userId);
    }
}
