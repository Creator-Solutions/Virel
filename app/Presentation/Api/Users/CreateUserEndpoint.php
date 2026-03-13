<?php

namespace App\Presentation\Api\Users;

use App\Application\UseCases\CreateUserUseCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreateUserEndpoint
{
    public function __construct(
        private readonly CreateUserUseCase $createUserUseCase
    ) {}

    public function handle(Request $request): JsonResponse
    {
        try {
            $data = $request->only(['name', 'email']);
            
            $user = $this->createUserUseCase->execute($data);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $user->getId(),
                    'name' => $user->getName(),
                    'email' => $user->getEmail()->getValue(),
                    'created_at' => $user->getCreatedAt()->format('Y-m-d H:i:s'),
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
                'message' => 'An error occurred while creating the user'
            ], 500);
        }
    }
}
