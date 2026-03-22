<?php

namespace App\Http\Endpoints\Api\Auth\CreateSession;

use App\Application\Auth\CreateSession\CreateSessionCommand;
use App\Application\Auth\CreateSession\CreateSessionCommandHandler;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

class CreateSessionEndpoint
{
    public static function mapCreateSessionEndpoint()
    {
        Route::post('/login', self::class)->name('auth.login');
    }

    public function __invoke(Request $request, CreateSessionCommandHandler $handler)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $cmd = new CreateSessionCommand($validated['email'], $validated['password']);
        $result = $handler->handle($cmd);

        return response()
            ->json(['user' => $result['user']], 200)
            ->cookie('auth_token', $result['token'], 60, '/', null, false, true);
    }
}
