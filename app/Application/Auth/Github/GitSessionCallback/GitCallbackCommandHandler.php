<?php

namespace App\Application\Auth\Github\GitSessionCallback;

use App\Infrastructure\Persistence\Models\User;
use App\Domain\Auth\Contracts\IUserRepository;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;

class GitCallbackCommandHandler
{
    private readonly IUserRepository $user_repository;

    public function __construct(IUserRepository $user_repository)
    {
        $this->user_repository = $user_repository;
    }

    public function handle(GitCallbackCommand $command)
    {

        $isDev = config('app.ssl_verify') === false;

        // Initial Token Request
        $tokenResponse = Http::when($isDev, fn ($http) => $http->withoutVerifying())->withHeaders([
            'Accept' => 'application/json',
            'User-Agent' => 'Virel',
        ])->post('https://github.com/login/oauth/access_token', [
            'client_id' => env('GITHUB_CLIENT_ID'),
            'client_secret' => env('GITHUB_CLIENT_SECRET'),
            'code' => $command->code,
        ]);

        $tokenData = $tokenResponse->json();

        if (isset($tokenData['error']) || ! isset($tokenData['access_token'])) {
            throw new \DomainException($tokenData['error_description'] ?? 'Could not retrieve access token');
        }

        $githubUser = Http::when($isDev, fn ($http) => $http->withoutVerifying())
            ->withHeaders(['Authorization' => "Bearer {$tokenData['access_token']}", 'User-Agent' => 'Virel'])
            ->get('https://api.github.com/user');

        if (! $githubUser->successful()) {
            throw new \DomainException('Failed to retrieve GitHub user');
        }

        $userData = $githubUser->json();

        $user = $this->user_repository->findByGithubId($userData['id']);

        if (! $user) {
            $user = User::create([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'github_id' => $userData['id'],
                'avatar_url' => $userData['avatar_url'],
                'role' => 'developer',
                'is_github_account' => true,
                'password' => Hash::make(str()->random(32)),
            ]);
        }

        Auth::login($user);
        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'name' => $user->name,
            ],
        ];
    }
}
