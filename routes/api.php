<?php

use App\Http\Controllers\Api\Projects\DeleteProjectController;
use App\Http\Controllers\Api\Projects\ProjectController;
use App\Http\Controllers\Api\Projects\ReceiveArtifactController;
use App\Http\Controllers\Api\Projects\RegenerateWebhookSecretController;
use App\Http\Controllers\Api\Projects\UpdateProjectController;
use App\Http\Controllers\Api\Users\DeleteUserController;
use App\Http\Controllers\Api\Users\InviteUserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1/auth')->group(function () {});

Route::middleware('throttle:30,1')->group(function () {
    Route::post('/webhook/{projectId}', ReceiveArtifactController::class);
});

Route::prefix('v1')->middleware(['auth:sanctum'])->group(function () {
    Route::post('/projects', ProjectController::class);
    Route::patch('/projects/{id}', UpdateProjectController::class);
    Route::post('/projects/{id}/regenerate-secret', RegenerateWebhookSecretController::class);
    Route::delete('/projects/{id}', DeleteProjectController::class);

    Route::post('/users', InviteUserController::class);
    Route::delete('/users/{id}', DeleteUserController::class);
});
