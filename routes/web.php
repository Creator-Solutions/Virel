<?php

use App\Http\Controllers\Api\Auth\CreateGithubSessionController;
use App\Http\Controllers\Api\Auth\CreateSessionController;
use App\Http\Controllers\Api\Auth\GithubSessionCallbackController;
use App\Http\Controllers\Web\Auth\ForgotPasswordController;
use App\Http\Controllers\Web\Auth\LoginController;
use App\Http\Controllers\Web\Auth\ResetPasswordController;
use App\Http\Controllers\Web\Home\CreateProjectController;
use App\Http\Controllers\Web\Home\DashboardController;
use App\Http\Controllers\Web\Home\DeleteProjectController;
use App\Http\Controllers\Web\Home\DeploymentDetailController;
use App\Http\Controllers\Web\Home\DeploymentHistoryController;
use App\Http\Controllers\Web\Home\EditUserController;
use App\Http\Controllers\Web\Home\EnvVarsController;
use App\Http\Controllers\Web\Home\ProjectDetailController;
use App\Http\Controllers\Web\Home\ProjectsController;
use App\Http\Controllers\Web\Home\ProjectSettingsController;
use App\Http\Controllers\Web\Home\RegenerateWebhookSecretController;
use App\Http\Controllers\Web\Home\SettingsController;
use App\Http\Controllers\Web\Home\StoreProjectController;
use App\Http\Controllers\Web\Home\UpdateProjectController;
use App\Http\Controllers\Web\Home\UsersController;
use Illuminate\Support\Facades\Route;

Route::get('/login', LoginController::class)->name('login');
Route::get('/forgot-password', ForgotPasswordController::class)->name('web.auth.forgot-password');
Route::get('/reset-password', ResetPasswordController::class)->name('web.auth.reset-password');

Route::post('/login', CreateSessionController::class)->name('auth.login');
Route::post('/home/projects/create', StoreProjectController::class)->name('home.project.create')->middleware(['auth']);

Route::get('/github-oauth', CreateGithubSessionController::class)->name('auth.github');
Route::get('/github/callback', GithubSessionCallbackController::class)->name('auth.git.callback');

Route::get('/home/dashboard', DashboardController::class)
    ->name('home.dashboard')
    ->middleware(['auth']);
Route::get('/home/projects', ProjectsController::class)
    ->name('home.projects.index')
    ->middleware(['auth']);
Route::get('/home/projects/create', CreateProjectController::class)
    ->name('home.projects.create')
    ->middleware(['auth']);
Route::get('/home/projects/{id}', ProjectDetailController::class)
    ->name('home.projects.show')
    ->middleware(['auth']);
Route::get('/home/projects/{id}/settings', ProjectSettingsController::class)
    ->name('home.projects.settings')
    ->middleware(['auth']);
Route::patch('/home/projects/{id}', UpdateProjectController::class)
    ->name('home.projects.update')
    ->middleware(['auth']);
Route::post('/home/projects/{id}/regenerate-secret', RegenerateWebhookSecretController::class)
    ->name('home.projects.regenerate-secret')
    ->middleware(['auth']);
Route::delete('/home/projects/{id}', DeleteProjectController::class)
    ->name('home.projects.delete')
    ->middleware(['auth']);
Route::get('/home/projects/{id}/deployments', DeploymentHistoryController::class)
    ->name('home.projects.deployments')
    ->middleware(['auth']);
Route::get('/home/projects/{id}/deployments/{deploymentId}', DeploymentDetailController::class)
    ->name('home.projects.deployments.show')
    ->middleware(['auth']);
Route::get('/home/projects/{id}/env', EnvVarsController::class)
    ->name('home.projects.env')
    ->middleware(['auth']);
Route::get('/home/users', UsersController::class)
    ->name('home.users.index')
    ->middleware(['auth']);
Route::get('/home/users/{id}/edit', EditUserController::class)
    ->name('home.users.edit')
    ->middleware(['auth']);
Route::get('/home/settings', SettingsController::class)
    ->name('home.settings')
    ->middleware(['auth']);

Route::get('sanctum/csrf-cookie', function () {
    return response()->json(['csrf_token' => csrf_token()]);
});
