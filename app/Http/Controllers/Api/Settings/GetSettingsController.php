<?php

namespace App\Http\Controllers\Api\Settings;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Models\Setting;
use Illuminate\Http\JsonResponse;

class GetSettingsController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'virel_url' => Setting::get('virel_url', ''),
        ]);
    }
}
