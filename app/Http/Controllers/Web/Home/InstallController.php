<?php

namespace App\Http\Controllers\Web\Home;

use App\Http\Controllers\Controller;

class InstallController extends Controller
{
    public function __invoke()
    {
        $basePath = base_path();

        if (file_exists($basePath.'/.installed')) {
            return redirect('/login');
        }

        include $basePath.'/public/install.php';

        return response()->make('', 200);
    }
}
