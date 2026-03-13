<?php

namespace App\Presentation\Api\Users;

use App\Application\Services\UserService;
use Illuminate\Http\JsonResponse;

class ListUsersEndpoint
{
    public function __construct(
        private readonly UserService $userService
    ) {}

    public function handle(): JsonResponse
    {
        try {
            $users = $this->userService->getUsers();

            $data = array_map(function ($user) {
                return [
                    'id' => $user->getId(),
                    'name' => $user->getName(),
                    'email' => $user->getEmail()->getValue(),
                    'created_at' => $user->getCreatedAt()->format('Y-m-d H:i:s'),
                ];
            }, $users);

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while fetching users'
            ], 500);
        }
    }
}
