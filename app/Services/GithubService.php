<?php

namespace App\Services;

use App\Infrastructure\Persistence\Models\Project;
use App\Infrastructure\Persistence\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GithubService
{
    private const API_BASE_URL = 'https://api.github.com';

    public function createWebhook(Project $project): bool
    {
        if (empty($project->github_pat)) {
            Log::warning("Cannot create webhook for project {$project->id}: no PAT configured");

            return false;
        }

        $virelUrl = $this->getVirelUrl();

        if (! $virelUrl) {
            Log::warning("Cannot create webhook for project {$project->id}: Virel URL not configured in Instance Settings");

            return false;
        }

        $url = sprintf(
            '%s/repos/%s/%s/hooks',
            self::API_BASE_URL,
            $project->github_owner,
            $project->github_repo
        );

        try {
            $response = Http::withHeaders($this->getHeaders($project->github_pat))
                ->timeout(30)
                ->post($url, [
                    'config' => [
                        'url' => $this->getWebhookUrl($project),
                        'content_type' => 'json',
                        'secret' => $project->webhook_secret,
                        'insecure_ssl' => '0',
                    ],
                    'events' => ['push'],
                    'active' => true,
                ]);

            if ($response->successful()) {
                $hookData = $response->json();
                $project->update(['github_hook_id' => $hookData['id']]);
                Log::info("Created webhook {$hookData['id']} for project {$project->name}");

                return true;
            }

            $responseBody = $response->json();
            $errorMessage = $responseBody['errors'][0]['message'] ?? $response->body();

            Log::warning("Failed to create webhook for project {$project->name}: {$errorMessage}", [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return false;
        } catch (\Exception $e) {
            Log::warning("Exception creating webhook for project {$project->name}: ".$e->getMessage());

            return false;
        }
    }

    public function deleteWebhook(Project $project): bool
    {
        if (empty($project->github_hook_id)) {
            return true;
        }

        if (empty($project->github_pat)) {
            Log::warning("Cannot delete webhook for project {$project->id}: no PAT configured");

            return false;
        }

        $url = sprintf(
            '%s/repos/%s/%s/hooks/%s',
            self::API_BASE_URL,
            $project->github_owner,
            $project->github_repo,
            $project->github_hook_id
        );

        try {
            $response = Http::withHeaders($this->getHeaders($project->github_pat))
                ->timeout(30)
                ->delete($url);

            if ($response->successful() || $response->status() === 404) {
                Log::info("Deleted webhook {$project->github_hook_id} for project {$project->name}");

                return true;
            }

            Log::error("Failed to delete webhook for project {$project->name}", [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return false;
        } catch (\Exception $e) {
            Log::error("Exception deleting webhook for project {$project->name}: ".$e->getMessage());

            return false;
        }
    }

    public function verifyRepository(string $owner, string $repo, string $pat): bool
    {
        $url = sprintf('%s/repos/%s/%s', self::API_BASE_URL, $owner, $repo);

        try {
            $response = Http::withHeaders($this->getHeaders($pat))
                ->timeout(30)
                ->get($url);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error("Failed to verify repository {$owner}/{$repo}: ".$e->getMessage());

            return false;
        }
    }

    public function getCommitInfo(string $owner, string $repo, string $sha, string $pat): ?array
    {
        $url = sprintf('%s/repos/%s/%s/commits/%s', self::API_BASE_URL, $owner, $repo, $sha);

        try {
            $response = Http::withHeaders($this->getHeaders($pat))
                ->timeout(30)
                ->get($url);

            if ($response->successful()) {
                $data = $response->json();

                return [
                    'sha' => $data['sha'],
                    'message' => $data['commit']['message'],
                    'author' => $data['commit']['author']['name'],
                    'author_email' => $data['commit']['author']['email'],
                    'date' => $data['commit']['author']['date'],
                    'html_url' => $data['html_url'],
                ];
            }

            return null;
        } catch (\Exception $e) {
            Log::error("Failed to get commit info for {$owner}/{$repo}/{$sha}: ".$e->getMessage());

            return null;
        }
    }

    private function getVirelUrl(): ?string
    {
        $setting = Setting::where('key', 'virel_url')->first();

        if ($setting && $setting->value) {
            return rtrim($setting->value, '/');
        }

        return null;
    }

    private function getWebhookUrl(Project $project): string
    {
        $baseUrl = $this->getVirelUrl() ?? config('app.url');

        return "{$baseUrl}/api/webhook/{$project->id}";
    }

    private function getHeaders(string $pat): array
    {
        return [
            'Authorization' => "Bearer {$pat}",
            'Accept' => 'application/vnd.github+json',
            'X-GitHub-Api-Version' => '2022-11-28',
            'User-Agent' => 'Virel-CI/1.0',
        ];
    }
}
