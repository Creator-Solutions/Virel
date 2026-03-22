<?php

namespace App\Http\Endpoints\Api\Auth\Github;

use App\Application\Auth\Github\CreateGitSession\CreateGitSessionCommandHandler;
use Illuminate\Support\Facades\Route;

class CreateGithubSessionEndpoint
{
    public static function mapCreateGithubSessionEndpoint()
    {
        Route::get('github-oauth', self::class)->name('auth.github');
    }

    public function __invoke(CreateGitSessionCommandHandler $handler)
    {
        return $handler->handle();
    }
}
