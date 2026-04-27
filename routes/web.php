<?php

use App\Http\Controllers\Api\Auth\CreateGithubSessionController;
use App\Http\Controllers\Api\Auth\CreateSessionController;
use App\Http\Controllers\Api\Auth\GithubSessionCallbackController;
use App\Http\Controllers\Api\Deployments\GetDeploymentController;
use App\Http\Controllers\Api\Deployments\GetDeploymentLogController;
use App\Http\Controllers\Api\Projects\DeleteProjectController;
use App\Http\Controllers\Api\Projects\DeploymentController;
use App\Http\Controllers\Api\Projects\RegenerateWebhookSecretController;
use App\Http\Controllers\Api\Projects\UpdateProjectController;
use App\Http\Controllers\Api\Settings\GetSettingsController;
use App\Http\Controllers\Api\Settings\PersonalPasswordController;
use App\Http\Controllers\Api\Settings\UpdateNotificationController;
use App\Http\Controllers\Api\Settings\UpdateProfileController;
use App\Http\Controllers\Api\Settings\UpdateSettingsController;
use App\Http\Controllers\Api\Users\DeleteUserController;
use App\Http\Controllers\Api\Users\InviteUserController;
use App\Http\Controllers\Api\Users\UpdatePasswordController;
use App\Http\Controllers\Api\Users\UpdateUserController;
use App\Http\Controllers\Web\Auth\ForgotPasswordController;
use App\Http\Controllers\Web\Auth\LoginController;
use App\Http\Controllers\Web\Auth\ResetPasswordController;
use App\Http\Controllers\Web\Home\CreateProjectController;
use App\Http\Controllers\Web\Home\DashboardController;
use App\Http\Controllers\Web\Home\InstallController;
use App\Http\Controllers\Web\Home\DeploymentDetailController;
use App\Http\Controllers\Web\Home\DeploymentHistoryController;
use App\Http\Controllers\Web\Home\EditUserController;
use App\Http\Controllers\Web\Home\EnvVarsController;
use App\Http\Controllers\Web\Home\ProjectDetailController;
use App\Http\Controllers\Web\Home\ProjectsController;
use App\Http\Controllers\Web\Home\ProjectSettingsController;
use App\Http\Controllers\Web\Home\SettingsController;
use App\Http\Controllers\Web\Home\StoreProjectController;
use App\Http\Controllers\Web\Home\UsersController;
use Illuminate\Support\Facades\Route;

Route::get('/', InstallController::class)->name('install');
Route::post('/', InstallController::class)->name('install.post');
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
Route::get('/home/projects/{id}/deployments', DeploymentHistoryController::class)
    ->name('home.projects.deployments')
    ->middleware(['auth']);
Route::get('/home/projects/{id}/deployments/{deploymentId}/data', GetDeploymentController::class)
    ->name('home.projects.deployments.data')
    ->middleware(['auth']);
Route::get('/home/projects/{id}/deployments/{deploymentId}/log', GetDeploymentLogController::class)
    ->name('home.projects.deployments.log')
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

Route::middleware(['auth'])->group(function () {
    Route::post('/home/projects', StoreProjectController::class)->name('home.projects.store');
    Route::patch('/home/projects/{id}', UpdateProjectController::class)->name('home.projects.update');
    Route::post('/home/projects/{id}/regenerate-secret', RegenerateWebhookSecretController::class)->name('home.projects.regenerate-secret');
    Route::delete('/home/projects/{id}', DeleteProjectController::class)->name('home.projects.delete');
    Route::get('/api/projects/{id}/deployments', [DeploymentController::class, 'index'])->name('home.projects.deployments.index');
    Route::post('/api/projects/{id}/artifacts/{artifactId}/rollback', [DeploymentController::class, 'rollback'])->name('home.projects.artifacts.rollback');
    Route::get('/home/projects/{id}/deployments/{deploymentId}/data', GetDeploymentController::class)->name('home.projects.deployments.data');
    Route::get('/home/projects/{id}/deployments/{deploymentId}/log', GetDeploymentLogController::class)->name('home.projects.deployments.log');

    Route::post('/home/users', InviteUserController::class)->name('home.users.invite');
    Route::patch('/home/users/{id}', UpdateUserController::class)->name('home.users.update');
    Route::patch('/home/users/{id}/password', UpdatePasswordController::class)->name('home.users.password.update');
    Route::delete('/home/users/{id}', DeleteUserController::class)->name('home.users.delete');

    Route::patch('/home/settings/profile', UpdateProfileController::class)->name('home.settings.profile.update');
    Route::patch('/home/settings/password', PersonalPasswordController::class)->name('home.settings.password.update');
    Route::patch('/home/settings/notifications', UpdateNotificationController::class)->name('home.settings.notifications.update');
    Route::get('/home/settings/data', [GetSettingsController::class, '__invoke'])->name('home.settings.data');
    Route::patch('/home/settings', [UpdateSettingsController::class, '__invoke'])->name('home.settings.update');
});

Route::get('sanctum/csrf-cookie', function () {
    return response()->json(['csrf_token' => csrf_token()]);
});