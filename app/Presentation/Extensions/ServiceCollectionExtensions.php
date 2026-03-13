<?php

namespace App\Presentation\Extensions;

use App\Application\Commands\CreateOrderCommand;
use App\Application\Commands\CreateUserCommand;
use App\Application\Queries\GetOrdersQuery;
use App\Application\Queries\GetUsersQuery;
use App\Application\Services\OrderService;
use App\Application\Services\UserService;
use App\Application\UseCases\CreateUserUseCase;
use App\Domain\Interfaces\OrderRepositoryInterface;
use App\Domain\Interfaces\UserRepositoryInterface;
use App\Infrastructure\Persistence\Repositories\OrderRepository;
use App\Infrastructure\Persistence\Repositories\UserRepository;
use App\Infrastructure\Services\ExternalApis\ExampleApiService;
use App\Infrastructure\Services\FileWatcher\FileWatcherService;
use Illuminate\Support\ServiceProvider;

class ServiceCollectionExtensions extends ServiceProvider
{
    public function register(): void
    {
        $this->registerApplicationServices();
        $this->registerInfrastructureServices();
    }

    public static function registerApplicationServices(): void
    {
        $app = app();
        
        $app->singleton(CreateUserCommand::class);
        $app->singleton(CreateOrderCommand::class);
        $app->singleton(GetUsersQuery::class);
        $app->singleton(GetOrdersQuery::class);
        
        $app->singleton(UserService::class, function ($app) {
            return new UserService(
                createUserCommand: $app->make(CreateUserCommand::class),
                getUsersQuery: $app->make(GetUsersQuery::class)
            );
        });

        $app->singleton(OrderService::class, function ($app) {
            return new OrderService(
                createOrderCommand: $app->make(CreateOrderCommand::class),
                getOrdersQuery: $app->make(GetOrdersQuery::class)
            );
        });

        $app->singleton(CreateUserUseCase::class);
    }

    public static function registerInfrastructureServices(): void
    {
        $app = app();
        
        $app->singleton(UserRepositoryInterface::class, UserRepository::class);
        $app->singleton(OrderRepositoryInterface::class, OrderRepository::class);
        
        $app->singleton(FileWatcherService::class);
        $app->singleton(ExampleApiService::class);
    }
}
