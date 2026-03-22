<?php

namespace App\Http\Endpoints\Api\Auth;

use Illuminate\Support\Facades\Route;

use App\Http\Endpoints\Api\Auth\CreateSession\CreateSessionEndpoint;
use App\Http\Endpoints\Api\Auth\Github\CreateGithubSessionEndpoint;
use App\Http\Endpoints\Api\Auth\Github\GithubSessionCallbackEndpoint;

class MapAuthEndpoints{

   public static function mapAuthEndpoints(){
      Route::prefix('auth')->group(function(){
         CreateSessionEndpoint::mapCreateSessionEndpoint();
         CreateGithubSessionEndpoint::mapCreateGithubSessionEndpoint();
         GithubSessionCallbackEndpoint::mapGithubSessionEndpoint();
      });
   }
}