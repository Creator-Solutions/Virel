<?php

namespace App\Http\Endpoints\Api\Auth\Github;

use App\Application\Auth\Github\GitSessionCallback\GitCallbackCommand;
use App\Application\Auth\Github\GitSessionCallback\GitCallbackCommandHandler;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

class GithubSessionCallbackEndpoint
{
    public static function mapGithubSessionEndpoint()
    {
        Route::get('github/oauth/callback', self::class)->name('auth.git.callback');
    }

    public function __invoke(Request $request, GitCallbackCommandHandler $handler)
    {
        $code = $request->query('code');

        if (! $code) {
            return redirect()->route('web.auth.login')
                ->withErrors(['message' => 'Missing OAuth code']);
        }

        try {
            $result = $handler->handle(new GitCallbackCommand($code));
        } catch (\DomainException $e) {
            return redirect()->route('web.auth.login')
                ->withErrors(['message' => $e->getMessage()]);
        }

        return redirect()->route('dashboard')
            ->cookie('auth_token', $result['token'], 60, '/', null, true, true);
    }
}
