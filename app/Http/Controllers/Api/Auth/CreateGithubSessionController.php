<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Support\Str;

class CreateGithubSessionController extends Controller
{
    public function __invoke()
    {
        $state = Str::random(40);
        session(['github_oauth_state' => $state]);

        $clientId = getenv('GITHUB_CLIENT_ID');

        return redirect("https://github.com/login/oauth/authorize?client_id=$clientId&scope=repo&state=$state");
    }
}
