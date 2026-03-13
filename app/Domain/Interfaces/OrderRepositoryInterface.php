<?php

namespace App\Domain\Interfaces;

use App\Domain\Entities\Order;

interface OrderRepositoryInterface
{
    public function findById(string $id): ?Order;
    public function findByUserId(string $userId): array;
    public function findAll(): array;
    public function save(Order $order): Order;
    public function delete(string $id): bool;
}
