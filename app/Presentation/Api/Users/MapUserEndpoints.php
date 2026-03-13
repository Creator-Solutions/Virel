<?php

namespace App\Presentation\Api\Users;

use Illuminate\Support\Facades\Route;

class MapUserEndpoints
{
    public static function map(): void
    {
        Route::prefix('users')->group(function () {
            Route::get('/', [ListUsersEndpoint::class, 'handle']);
            Route::post('/', [CreateUserEndpoint::class, 'handle']);
        });
    }
}
