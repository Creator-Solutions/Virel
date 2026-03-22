<?php

namespace App\Http\Endpoints\Web\Protected;

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

class DashboardPageRoute{

   public static function mapDashboardRoute(){
      Route::get('dashboard', self::class)->name('dashboard');
   }

   public function __invoke()
   {
      return Inertia::render('dashboard/index');
   }
}