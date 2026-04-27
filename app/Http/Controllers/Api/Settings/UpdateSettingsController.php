<?php

namespace App\Http\Controllers\Api\Settings;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UpdateSettingsController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'virel_url' => ['nullable', 'url', 'max:500'],
            'mail' => 'nullable|array',
            'mail.MAIL_HOST' => 'nullable|string|max:255',
            'mail.MAIL_PORT' => 'nullable|integer|min:1|max:65535',
            'mail.MAIL_USERNAME' => 'nullable|string|max:255',
            'mail.MAIL_PASSWORD' => 'nullable|string|max:255',
            'mail.MAIL_ENCRYPTION' => 'nullable|in:tls,ssl,none',
            'mail.MAIL_FROM_ADDRESS' => 'nullable|email|max:255',
            'mail.MAIL_FROM_NAME' => 'nullable|string|max:255',
        ]);

        Setting::set('virel_url', $validated['virel_url'] ?? null);

        if (! empty($validated['mail'])) {
            $mailData = $validated['mail'];
            $existingPassword = Setting::get('MAIL_PASSWORD');

            $fields = [
                'MAIL_HOST' => $mailData['MAIL_HOST'] ?? null,
                'MAIL_PORT' => $mailData['MAIL_PORT'] ?? null,
                'MAIL_USERNAME' => $mailData['MAIL_USERNAME'] ?? null,
                'MAIL_ENCRYPTION' => $mailData['MAIL_ENCRYPTION'] ?? null,
                'MAIL_FROM_ADDRESS' => $mailData['MAIL_FROM_ADDRESS'] ?? null,
                'MAIL_FROM_NAME' => $mailData['MAIL_FROM_NAME'] ?? null,
            ];

            foreach ($fields as $key => $value) {
                if ($value !== null && $value !== '') {
                    Setting::set($key, $value);
                }
            }

            if (isset($mailData['MAIL_PASSWORD']) && $mailData['MAIL_PASSWORD'] !== '********') {
                Setting::set('MAIL_PASSWORD', $mailData['MAIL_PASSWORD']);
            } elseif (isset($mailData['MAIL_PASSWORD']) && $mailData['MAIL_PASSWORD'] === '********' && $existingPassword) {
                Setting::set('MAIL_PASSWORD', $existingPassword);
            }
        }

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
