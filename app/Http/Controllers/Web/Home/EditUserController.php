<?php

namespace App\Http\Controllers\Web\Home;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EditUserController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = User::findOrFail($request->route('id'));

        return Inertia::render('home/users/edit/index', [
            'user' => $user,
        ]);
    }
}
