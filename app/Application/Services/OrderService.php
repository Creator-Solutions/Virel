<?php

namespace App\Application\Services;

use App\Application\Commands\CreateOrderCommand;
use App\Application\DTOs\CreateOrderDTO;
use App\Application\Queries\GetOrdersQuery;
use App\Domain\Entities\Order;

class OrderService
{
    public function __construct(
        private readonly CreateOrderCommand $createOrderCommand,
        private readonly GetOrdersQuery $getOrdersQuery
    ) {}

    public function createOrder(array $data): Order
    {
        $dto = CreateOrderDTO::fromArray($data);
        return $this->createOrderCommand->execute($dto);
    }

    public function getOrders(): array
    {
        return $this->getOrdersQuery->execute();
    }

    public function getOrderById(string $id): ?Order
    {
        return $this->getOrdersQuery->executeById($id);
    }

    public function getOrdersByUserId(string $userId): array
    {
        return $this->getOrdersQuery->executeByUserId($userId);
    }
}
