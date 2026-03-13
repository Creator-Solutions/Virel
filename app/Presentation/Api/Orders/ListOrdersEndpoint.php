<?php

namespace App\Presentation\Api\Orders;

use App\Application\Services\OrderService;
use Illuminate\Http\JsonResponse;

class ListOrdersEndpoint
{
    public function __construct(
        private readonly OrderService $orderService
    ) {}

    public function handle(): JsonResponse
    {
        try {
            $orders = $this->orderService->getOrders();

            $data = array_map(function ($order) {
                return [
                    'id' => $order->getId(),
                    'user_id' => $order->getUserId(),
                    'total_amount' => $order->getTotalAmount(),
                    'status' => $order->getStatus(),
                    'created_at' => $order->getCreatedAt()->format('Y-m-d H:i:s'),
                ];
            }, $orders);

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while fetching orders'
            ], 500);
        }
    }
}
