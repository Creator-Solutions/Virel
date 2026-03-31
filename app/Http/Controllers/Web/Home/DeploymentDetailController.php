<?php

namespace App\Http\Controllers\Web\Home;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class DeploymentDetailController extends Controller
{
    public function __invoke()
    {
        return Inertia::render('home/projects/deployments/detail/index');
    }
}
