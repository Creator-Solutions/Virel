<?php

namespace App\Http\Controllers\Api\Settings;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UpdateNotificationController extends Controller
{
    public function __invoke(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        $validated = $request->validate([
            'notify_deployment_success' => ['nullable', 'boolean'],
            'notify_deployment_failure' => ['nullable', 'boolean'],
        ]);

        $user->update([
            'notify_deployment_success' => $validated['notify_deployment_success'] ?? false,
            'notify_deployment_failure' => $validated['notify_deployment_failure'] ?? false,
        ]);

        $user->refresh();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'notify_deployment_success' => $user->notify_deployment_success,
                'notify_deployment_failure' => $user->notify_deployment_failure,
            ],
        ]);
    }
}
