<?php

namespace App\Application\Auth\Github\CreateGitSession;

class CreateGitSessionCommandHandler
{
    public function handle()
    {
        $clientId = getenv('GITHUB_CLIENT_ID');
        return redirect("https://github.com/login/oauth/authorize?client_id=$clientId&scope=repo");
    }
}
