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
        ]);

        Setting::set('virel_url', $validated['virel_url'] ?? null);

        return response()->json([
            'virel_url' => Setting::get('virel_url', ''),
        ]);
    }
}
