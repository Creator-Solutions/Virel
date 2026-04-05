<?php

namespace App\Listeners;

use App\Events\ProjectCreated;
use App\Services\GithubActionsService;
use App\Services\GithubService;
use Illuminate\Support\Facades\Log;

class HandleProjectCreated
{
    public function __construct(
        private GithubService $githubService,
        private GithubActionsService $githubActionsService
    ) {}

    public function handle(ProjectCreated $event): void
    {
        $project = $event->project;

        if (empty($project->github_pat)) {
            Log::info("Project {$project->name} created without PAT, skipping webhook setup");

            return;
        }

        $webhookSuccess = $this->githubService->createWebhook($project);

        if (! $webhookSuccess) {
            Log::warning("Failed to create webhook for project {$project->name}");

            return;
        }

        $workflowSuccess = $this->githubActionsService->createWorkflow($project);

        if ($workflowSuccess) {
            $project->update(['github_setup_pending' => false]);
            Log::info("GitHub setup completed for project {$project->name}");
        } else {
            Log::warning("Webhook created but workflow creation failed for project {$project->name}");
        }
    }
}
