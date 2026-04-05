<?php

namespace App\Http\Controllers\Api\Auth;

use App\Domain\Auth\Contracts\IUserRepository;
use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;

class GithubSessionCallbackController extends Controller
{
    public function __invoke(Request $request, IUserRepository $user_repository)
    {
        $code = $request->query('code');
        $returnedState = $request->query('state');
        $storedState = session('github_oauth_state');

        if (! $returnedState || ! $storedState || ! hash_equals($storedState, $returnedState)) {
            abort(403, 'Invalid OAuth state parameter.');
        }

        session()->forget('github_oauth_state');

        if (! $code) {
            return redirect()->route('web.auth.login')
                ->withErrors(['message' => 'Missing OAuth code']);
        }

        try {
            $isDev = config('app.ssl_verify') === false;

            $tokenResponse = Http::when($isDev, fn ($http) => $http->withoutVerifying())->withHeaders([
                'Accept' => 'application/json',
                'User-Agent' => 'Virel',
            ])->post('https://github.com/login/oauth/access_token', [
                'client_id' => env('GITHUB_CLIENT_ID'),
                'client_secret' => env('GITHUB_CLIENT_SECRET'),
                'code' => $code,
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

            $user = $user_repository->findByGithubId($userData['id']);

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

            return redirect()->route('home')
                ->cookie('auth_token', $token, 60, '/', null, true, true);
        } catch (\DomainException $e) {
            return redirect()->route('web.auth.login')
                ->withErrors(['message' => $e->getMessage()]);
        }
    }
}
