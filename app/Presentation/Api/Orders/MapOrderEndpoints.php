<?php

namespace App\Presentation\Api\Orders;

use Illuminate\Support\Facades\Route;

class MapOrderEndpoints
{
    public static function map(): void
    {
        Route::prefix('orders')->group(function () {
            Route::get('/', [ListOrdersEndpoint::class, 'handle']);
            Route::post('/', [CreateOrderEndpoint::class, 'handle']);
        });
    }
}
