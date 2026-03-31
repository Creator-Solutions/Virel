<?php

namespace App\Http\Controllers\Web\Home;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function __invoke()
    {
        return Inertia::render('home/settings/index');
    }
}
