<?php

namespace App\Http\Controllers\Web\Home;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Models\User;
use Inertia\Inertia;

class UsersController extends Controller
{
    public function __invoke()
    {
        $users = User::orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('home/users/index', [
            'users' => $users,
        ]);
    }
}
