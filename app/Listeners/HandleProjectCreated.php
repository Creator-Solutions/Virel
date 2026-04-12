<?php

namespace App\Listeners;

use App\Events\ProjectCreated;
use App\Events\ProjectPatUpdated;
use App\Services\GithubActionsService;
use App\Services\GithubService;
use Illuminate\Support\Facades\Log;

class HandleProjectCreated
{
    public function __construct(
        private GithubService $githubService,
        private GithubActionsService $githubActionsService
    ) {}

    public function handle(ProjectCreated|ProjectPatUpdated $event): void
    {
        $project = $event->project;

        if (empty($project->github_pat)) {
            $project->update(['github_setup_pending' => true]);
            Log::info("Project {$project->name} has no PAT — GitHub setup skipped.");
            return;
        }

        // Step 1 — Create the GitHub webhook
        $webhookSuccess = $this->githubService->createWebhook($project);

        if (!$webhookSuccess) {
            $project->update(['github_setup_pending' => true]);
            Log::warning("Webhook creation failed for project {$project->name} — marking as pending.");
            return;
        }

        // Step 2 — Create VIREL_SECRET + commit workflow file
        $this->githubActionsService->setupProject($project);

        Log::info("GitHub setup completed for project {$project->name}");
    }
}