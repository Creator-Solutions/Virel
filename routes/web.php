<?php

use Illuminate\Support\Facades\Route;

use App\Http\Endpoints\Web\MapWebRoutes;

MapWebRoutes::mapPageRoutes();
Route::get('sanctum/csrf-cookie', function () {
    return response()->json(['csrf_token' => csrf_token()]);
});