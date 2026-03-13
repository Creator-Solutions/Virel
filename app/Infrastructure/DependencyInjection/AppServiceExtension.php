<?php

namespace App\Infrastructure\DependencyInjection;

use App\Application\Commands\CreateUserCommand;
use App\Application\Queries\GetUsersQuery;
use App\Application\Services\UserService;
use App\Application\UseCases\CreateUserUseCase;
use App\Domain\Interfaces\OrderRepositoryInterface;
use App\Domain\Interfaces\UserRepositoryInterface;
use App\Infrastructure\Persistence\Repositories\OrderRepository;
use App\Infrastructure\Persistence\Repositories\UserRepository;
use App\Infrastructure\Services\ExternalApis\ExampleApiService;
use App\Infrastructure\Services\FileWatcher\FileWatcherService;
use Illuminate\Support\ServiceProvider;

class AppServiceExtension extends ServiceProvider
{
    public function register(): void
    {
        $this->registerInfrastructureServices();
        $this->registerApplicationServices();
    }

    public function registerInfrastructureServices(): void
    {
        $this->app->singleton(UserRepositoryInterface::class, UserRepository::class);
        $this->app->singleton(OrderRepositoryInterface::class, OrderRepository::class);
        
        $this->app->singleton(FileWatcherService::class);
        $this->app->singleton(ExampleApiService::class);
    }

    public function registerApplicationServices(): void
    {
        $this->app->singleton(CreateUserCommand::class);
        $this->app->singleton(GetUsersQuery::class);
        
        $this->app->singleton(UserService::class, function ($app) {
            return new UserService(
                createUserCommand: $app->make(CreateUserCommand::class),
                getUsersQuery: $app->make(GetUsersQuery::class)
            );
        });

        $this->app->singleton(CreateUserUseCase::class);
    }
}
