<?php

use App\Http\Controllers\Api\Projects\DeleteProjectController;
use App\Http\Controllers\Api\Projects\EnvironmentVariableController;
use App\Http\Controllers\Api\Projects\ImportDatabaseController;
use App\Http\Controllers\Api\Projects\ProjectController;
use App\Http\Controllers\Api\Projects\ReceiveArtifactController;
use App\Http\Controllers\Api\Projects\RegenerateWebhookSecretController;
use App\Http\Controllers\Api\Projects\UpdateProjectController;
use App\Http\Controllers\Api\Projects\UploadSqlController;
use App\Http\Controllers\Api\Users\DeleteUserController;
use App\Http\Controllers\Api\Users\InviteUserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware('throttle:30,1')->group(function () {
    Route::post('/webhook/{projectId}', ReceiveArtifactController::class);
});

Route::prefix('v1')->middleware(['auth:sanctum'])->group(function () {
    Route::post('/projects', ProjectController::class);
    Route::patch('/projects/{id}', UpdateProjectController::class);
    Route::post('/projects/{id}/regenerate-secret', RegenerateWebhookSecretController::class);
    Route::delete('/projects/{id}', DeleteProjectController::class);

    Route::get('/projects/{projectId}/env-vars', [EnvironmentVariableController::class, 'index']);
    Route::post('/projects/{projectId}/env-vars', [EnvironmentVariableController::class, 'store']);
    Route::patch('/projects/{projectId}/env-vars/{variableId}', [EnvironmentVariableController::class, 'update']);
    Route::delete('/projects/{projectId}/env-vars/{variableId}', [EnvironmentVariableController::class, 'destroy']);

    Route::get('/projects/{projectId}/sql-file', [UploadSqlController::class, 'show']);
    Route::post('/projects/{projectId}/sql-file', [UploadSqlController::class, '__invoke']);
    Route::post('/projects/{projectId}/import-database', ImportDatabaseController::class);

    Route::post('/users', InviteUserController::class);
    Route::delete('/users/{id}', DeleteUserController::class);
});

