<?php

namespace App\Http\Endpoints\Web\Auth;

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

class LoginPageRoute
{
    public static function mapLoginRoute()
    {
        Route::get('/login', self::class)->name('web.auth.login');
    }

    public function __invoke()
    {
        return Inertia::render('auth/login-page/index');
    }
}
