<?php

use Illuminate\Support\Facades\Route;
use App\Presentation\Api\Users\MapUserEndpoints;
use App\Presentation\Api\Orders\MapOrderEndpoints;

Route::inertia('/', 'welcome')->name('home');

Route::prefix('api')->group(function () {
    MapUserEndpoints::map();
    MapOrderEndpoints::map();
});
