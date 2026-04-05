<?php

namespace App\Http\Controllers\Web\Home;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function __invoke()
    {
        $user = Auth::user();

        return Inertia::render('home/settings/index', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'github_id' => $user->github_id,
                'avatar_url' => $user->avatar_url,
                'is_github_account' => $user->is_github_account,
                'notify_deployment_success' => $user->notify_deployment_success,
                'notify_deployment_failure' => $user->notify_deployment_failure,
            ],
        ]);
    }
}
