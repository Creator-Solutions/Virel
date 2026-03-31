<?php

namespace App\Http\Controllers\Web\Auth;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class LoginController extends Controller
{
    public function __invoke()
    {
        return Inertia::render('auth/login-page/index');
    }
}
