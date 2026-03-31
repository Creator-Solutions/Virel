<?php

namespace App\Http\Controllers\Web\Auth;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ForgotPasswordController extends Controller
{
    public function __invoke()
    {
        return Inertia::render('auth/forgot-password-page/index');
    }
}
