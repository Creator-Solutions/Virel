<?php

namespace App\Services;

use App\Infrastructure\Persistence\Models\Project;
use App\Infrastructure\Persistence\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GithubActionsService
{
    private const API_BASE_URL = 'https://api.github.com';

    private const WORKFLOW_PATH = '.github/workflows/virel-deploy.yml';

    private const MAX_RETRIES = 3;

    private const RETRY_DELAY_MS = 1000;

    // ─── ORCHESTRATOR ────────────────────────────────────────────────────────

    public function setupProject(Project $project): void
    {
        if (empty($project->github_pat)) {
            $project->update(['github_setup_pending' => true]);
            return;
        }

        $this->createRepositorySecret($project, 'VIREL_SECRET', $project->webhook_secret);
        $this->createWorkflow($project);
        $project->update(['github_setup_pending' => false]);
    }

    // ─── WORKFLOW ────────────────────────────────────────────────────────────

    public function createWorkflow(Project $project, int $attempt = 1): bool
    {
        if (empty($project->github_pat)) {
            Log::warning("Cannot create workflow for project {$project->id}: no PAT configured");
            return false;
        }

        $this->deleteWorkflowIfExists($project);

        $workflowContent = $this->generateWorkflowContent($project);
        $encodedContent  = base64_encode($workflowContent);

        $url = sprintf(
            '%s/repos/%s/%s/contents/%s',
            self::API_BASE_URL,
            $project->github_owner,
            $project->github_repo,
            self::WORKFLOW_PATH
        );

        try {
            $response = Http::withHeaders($this->getHeaders($project->github_pat))
                ->timeout(30)
                ->put($url, [
                    'message' => 'ci: Add Virel deployment workflow',
                    'content' => $encodedContent,
                    'branch'  => $project->github_branch ?? $this->getDefaultBranch($project),
                ]);

            if ($response->successful()) {
                Log::info("Created workflow file for project {$project->name}");
                return true;
            }

            $responseBody = $response->json();
            $errorMessage = $responseBody['errors'][0]['message'] ?? $response->body();

            if ($response->status() === 403 && $attempt < self::MAX_RETRIES) {
                Log::warning("Rate limited creating workflow for project {$project->name}, retrying (attempt {$attempt}/" . self::MAX_RETRIES . ')');
                usleep(self::RETRY_DELAY_MS * 1000 * $attempt);
                return $this->createWorkflow($project, $attempt + 1);
            }

            Log::warning("Failed to create workflow for project {$project->name}: {$errorMessage}", [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);

            return false;

        } catch (\Exception $e) {
            if ($attempt < self::MAX_RETRIES) {
                Log::warning("Exception creating workflow for project {$project->name}, retrying (attempt {$attempt}/" . self::MAX_RETRIES . '): ' . $e->getMessage());
                usleep(self::RETRY_DELAY_MS * 1000 * $attempt);
                return $this->createWorkflow($project, $attempt + 1);
            }

            Log::error("Exception creating workflow for project {$project->name}: " . $e->getMessage());
            return false;
        }
    }

    public function deleteWorkflowIfExists(Project $project): bool
    {
        if (empty($project->github_pat)) {
            return false;
        }

        $url = sprintf(
            '%s/repos/%s/%s/contents/%s',
            self::API_BASE_URL,
            $project->github_owner,
            $project->github_repo,
            self::WORKFLOW_PATH
        );

        try {
            $response = Http::withHeaders($this->getHeaders($project->github_pat))
                ->timeout(30)
                ->get($url);

            if ($response->status() === 404) {
                return true;
            }

            if (!$response->successful()) {
                return false;
            }

            $data   = $response->json();
            $sha    = $data['sha'];
            $branch = $project->github_branch ?? $this->getDefaultBranch($project);

            $deleteResponse = Http::withHeaders($this->getHeaders($project->github_pat))
                ->timeout(30)
                ->delete($url, [
                    'message' => 'ci: Remove Virel deployment workflow',
                    'sha'     => $sha,
                    'branch'  => $branch,
                ]);

            if ($deleteResponse->successful() || $deleteResponse->status() === 404) {
                Log::info("Deleted existing workflow file for project {$project->name}");
                return true;
            }

            return false;

        } catch (\Exception $e) {
            Log::error("Exception deleting workflow for project {$project->name}: " . $e->getMessage());
            return false;
        }
    }

    // ─── SECRETS ─────────────────────────────────────────────────────────────

    public function createRepositorySecret(Project $project, string $secretName, string $secretValue): bool
    {
        if (empty($project->github_pat)) {
            return false;
        }

        try {
            $keyResponse = Http::withHeaders($this->getHeaders($project->github_pat))
                ->timeout(30)
                ->get(sprintf(
                    '%s/repos/%s/%s/actions/secrets/public-key',
                    self::API_BASE_URL,
                    $project->github_owner,
                    $project->github_repo
                ));

            if (!$keyResponse->successful()) {
                Log::warning("Failed to get public key for {$project->github_repo}", [
                    'status' => $keyResponse->status(),
                ]);
                return false;
            }

            $keyData         = $keyResponse->json();
            $keyId           = $keyData['key_id'];
            $publicKey       = base64_decode($keyData['key']);
            $encryptedValue  = sodium_crypto_box_seal($secretValue, $publicKey);
            $encryptedBase64 = base64_encode($encryptedValue);

            $secretResponse = Http::withHeaders($this->getHeaders($project->github_pat))
                ->timeout(30)
                ->put(
                    sprintf(
                        '%s/repos/%s/%s/actions/secrets/%s',
                        self::API_BASE_URL,
                        $project->github_owner,
                        $project->github_repo,
                        $secretName
                    ),
                    [
                        'encrypted_value' => $encryptedBase64,
                        'key_id'          => $keyId,
                    ]
                );

            if ($secretResponse->successful()) {
                Log::info("Created GitHub Actions secret '{$secretName}' for {$project->github_repo}");
                return true;
            }

            Log::warning("Failed to create secret '{$secretName}' for {$project->github_repo}", [
                'status' => $secretResponse->status(),
                'body'   => $secretResponse->body(),
            ]);

            return false;

        } catch (\Exception $e) {
            Log::error("Exception creating secret for {$project->github_repo}: " . $e->getMessage());
            return false;
        }
    }

    // ─── WORKFLOW TEMPLATES ──────────────────────────────────────────────────

    private function generateWorkflowContent(Project $project): string
    {
        $webhookUrl = $this->getVirelUrl() . "/api/v1/webhook/{$project->id}";
        $branch     = $project->github_branch ?? $this->getDefaultBranch($project);

        return match ($project->framework_type) {
            'react-vite' => $this->generateReactViteWorkflow($webhookUrl, $branch),
            'wordpress'  => $this->generateWordPressWorkflow($webhookUrl, $branch),
            default      => $this->generateLaravelWorkflow($webhookUrl, $branch, $project->app_root_path),
        };
    }

    private function generateLaravelWorkflow(string $webhookUrl, string $branch, ?string $appRootPath): string
    {
        $githubSha     = '${{ github.sha }}';
        $commitMessage = '${{ github.event.head_commit.message }}';
        $actor         = '${{ github.actor }}';
        $virelSecret   = '${{ secrets.VIREL_SECRET }}';

        return <<<YAML
name: Deploy to Virel

on:
  push:
    branches:
      - {$branch}

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.4'

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Composer dependencies
        run: composer install --no-dev --optimize-autoloader

      - name: Install NPM dependencies
        run: npm ci

      - name: Build assets
        run: npm run build

      - name: Create deployment artifact
        run: |
          mkdir -p artifact/public_html
          mkdir -p artifact/app_root
          cp -r public/. artifact/public_html/
          cp -r app bootstrap config database resources routes storage vendor artisan artifact/app_root/
          zip -r virel-deploy.zip artifact/

      - name: Deploy to Virel
        run: |
          curl -X POST {$webhookUrl} \\
            -H "Authorization: Bearer {$virelSecret}" \\
            -F "artifact=@virel-deploy.zip" \\
            -F "commit_sha={$githubSha}" \\
            -F "commit_message={$commitMessage}" \\
            -F "triggered_by={$actor}" \\
            --fail

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: virel-deploy
          path: virel-deploy.zip
          retention-days: 7
YAML;
    }

    private function generateReactViteWorkflow(string $webhookUrl, string $branch): string
    {
        $githubSha     = '${{ github.sha }}';
        $commitMessage = '${{ github.event.head_commit.message }}';
        $actor         = '${{ github.actor }}';
        $virelSecret   = '${{ secrets.VIREL_SECRET }}';

        return <<<YAML
name: Deploy to Virel

on:
  push:
    branches:
      - {$branch}

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build for production
        run: npm run build

      - name: Create deployment artifact
        run: |
          mkdir -p artifact/public_html
          cp -r dist/. artifact/public_html/
          zip -r virel-deploy.zip artifact/

      - name: Deploy to Virel
        run: |
          curl -X POST {$webhookUrl} \\
            -H "Authorization: Bearer {$virelSecret}" \\
            -F "artifact=@virel-deploy.zip" \\
            -F "commit_sha={$githubSha}" \\
            -F "commit_message={$commitMessage}" \\
            -F "triggered_by={$actor}" \\
            --fail

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: virel-deploy
          path: virel-deploy.zip
          retention-days: 7
YAML;
    }

    private function generateWordPressWorkflow(string $webhookUrl, string $branch): string
    {
        $githubSha     = '${{ github.sha }}';
        $commitMessage = '${{ github.event.head_commit.message }}';
        $actor         = '${{ github.actor }}';
        $virelSecret   = '${{ secrets.VIREL_SECRET }}';

        return <<<YAML
name: Deploy to Virel

on:
  push:
    branches:
      - {$branch}

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Create deployment artifact
        run: |
          mkdir -p artifact/public_html
          cp -r . artifact/public_html/ --exclude='.git'
          zip -r virel-deploy.zip artifact/

      - name: Deploy to Virel
        run: |
          curl -X POST {$webhookUrl} \\
            -H "Authorization: Bearer {$virelSecret}" \\
            -F "artifact=@virel-deploy.zip" \\
            -F "commit_sha={$githubSha}" \\
            -F "commit_message={$commitMessage}" \\
            -F "triggered_by={$actor}" \\
            --fail

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: virel-deploy
          path: virel-deploy.zip
          retention-days: 7
YAML;
    }

    // ─── PRIVATE HELPERS ─────────────────────────────────────────────────────

    private function getVirelUrl(): string
    {
        $setting = Setting::where('key', 'virel_url')->first();

        if ($setting && $setting->value) {
            return rtrim($setting->value, '/');
        }

        return rtrim(config('app.url'), '/');
    }

    private function getDefaultBranch(Project $project): string
    {
        if (!empty($project->github_branch)) {
            return $project->github_branch;
        }

        try {
            $response = Http::withHeaders($this->getHeaders($project->github_pat))
                ->timeout(30)
                ->get(sprintf(
                    '%s/repos/%s/%s',
                    self::API_BASE_URL,
                    $project->github_owner,
                    $project->github_repo
                ));

            if ($response->successful()) {
                return $response->json()['default_branch'] ?? 'main';
            }
        } catch (\Exception $e) {
            Log::warning("Failed to get default branch for {$project->github_owner}/{$project->github_repo}: " . $e->getMessage());
        }

        return 'main';
    }

    private function getHeaders(string $pat): array
    {
        return [
            'Authorization'        => "Bearer {$pat}",
            'Accept'               => 'application/vnd.github+json',
            'X-GitHub-Api-Version' => '2022-11-28',
            'User-Agent'           => 'Virel-CI/1.0',
        ];
    }
}