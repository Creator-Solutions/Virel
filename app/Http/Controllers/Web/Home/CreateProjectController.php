<?php

namespace App\Http\Controllers\Web\Home;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Models\Setting;
use Inertia\Inertia;

class CreateProjectController extends Controller
{
    public function __invoke()
    {
        $virelUrl = Setting::where('key', 'virel_url')->first();

        return Inertia::render('home/projects/create/index', [
            'virel_url_configured' => ! empty($virelUrl?->value),
        ]);
    }
}
