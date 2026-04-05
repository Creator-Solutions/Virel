<?php

namespace App\Providers;

use App\Events\ProjectCreated;
use App\Events\ProjectPatUpdated;
use App\Listeners\HandleProjectCreated;
use App\Listeners\HandleProjectPatUpdated;
use Illuminate\Support\ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        ProjectCreated::class => [
            HandleProjectCreated::class,
        ],
        ProjectPatUpdated::class => [
            HandleProjectPatUpdated::class,
        ],
    ];

    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        //
    }
}
