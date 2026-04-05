<?php

namespace App\Listeners;

use App\Events\ProjectPatUpdated;
use App\Services\GithubService;
use Illuminate\Support\Facades\Log;

class HandleProjectPatUpdated
{
    public function __construct(private GithubService $githubService) {}

    public function handle(ProjectPatUpdated $event): void
    {
        $project = $event->project;

        if (empty($project->github_pat)) {
            Log::info("Project {$project->name} PAT removed, deleting webhook");
            $this->githubService->deleteWebhook($project);
            $project->update([
                'github_hook_id' => null,
                'github_setup_pending' => true,
            ]);

            return;
        }

        if ($project->github_hook_id) {
            $this->githubService->deleteWebhook($project);
        }

        $success = $this->githubService->createWebhook($project);

        if ($success) {
            $project->update(['github_setup_pending' => false]);
        }
    }
}
