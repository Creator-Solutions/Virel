<?php

namespace App\Http\Endpoints\Api;

use Illuminate\Support\Facades\Route;

use App\Http\Endpoints\Api\Auth\MapAuthEndpoints;

class MapApiEndpoints{

   public static function mapApiEndpoints(){

      Route::prefix('v1')->group(function(){
         MapAuthEndpoints::mapAuthEndpoints();
      });
   }
}