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
            'mail' => [
                'MAIL_HOST' => Setting::get('MAIL_HOST', ''),
                'MAIL_PORT' => (int) Setting::get('MAIL_PORT', '') ?: '',
                'MAIL_USERNAME' => Setting::get('MAIL_USERNAME', ''),
                'MAIL_PASSWORD' => Setting::get('MAIL_PASSWORD') ? '********' : '',
                'MAIL_ENCRYPTION' => Setting::get('MAIL_ENCRYPTION', ''),
                'MAIL_FROM_ADDRESS' => Setting::get('MAIL_FROM_ADDRESS', ''),
                'MAIL_FROM_NAME' => Setting::get('MAIL_FROM_NAME', ''),
            ],
        ]);
    }
}
