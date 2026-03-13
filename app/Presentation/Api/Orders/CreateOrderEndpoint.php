<?php

namespace App\Presentation\Api\Orders;

use App\Application\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreateOrderEndpoint
{
    public function __construct(
        private readonly OrderService $orderService
    ) {}

    public function handle(Request $request): JsonResponse
    {
        try {
            $data = $request->only(['user_id', 'total_amount', 'status']);
            
            $order = $this->orderService->createOrder($data);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $order->getId(),
                    'user_id' => $order->getUserId(),
                    'total_amount' => $order->getTotalAmount(),
                    'status' => $order->getStatus(),
                    'created_at' => $order->getCreatedAt()->format('Y-m-d H:i:s'),
                ]
            ], 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while creating the order'
            ], 500);
        }
    }
}
