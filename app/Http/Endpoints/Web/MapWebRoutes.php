<?php

namespace App\Http\Endpoints\Web;

use App\Http\Endpoints\Web\Auth\LoginPageRoute;
use App\Http\Endpoints\Web\Protected\DashboardPageRoute;

class MapWebRoutes
{
    public static function mapPageRoutes()
    {
        LoginPageRoute::mapLoginRoute();
        DashboardPageRoute::mapDashboardRoute();
    }
}
