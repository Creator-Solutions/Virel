<?php

namespace App\Services;

use App\Infrastructure\Persistence\Models\Artifact;
use App\Infrastructure\Persistence\Models\Deployment;
use App\Infrastructure\Persistence\Models\Project;
use App\Mail\DeploymentFailedMail;
use App\Mail\DeploymentSuccessMail;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use ZipArchive;

class DeploymentService
{
    public function receiveArtifacts(
        Project $project,
        array $artifacts,
        ?string $commitSha = null,
        ?string $branch = null,
        ?string $trigger = Deployment::TRIGGER_WEBHOOK
    ): Deployment {
        $deployment = Deployment::create([
            'project_id' => $project->id,
            'status' => Deployment::STATUS_RUNNING,
            'trigger' => $trigger,
            'triggered_by' => $project->user_id,
            'commit_sha' => $commitSha,
            'branch' => $branch,
            'started_at' => now(),
        ]);

        foreach ($artifacts as $artifact) {
            if ($artifact instanceof UploadedFile) {
                $this->saveArtifact($deployment, $artifact);
            }
        }

        $this->processDeployment($deployment);

        return $deployment;
    }

    public function processDeployment(Deployment $deployment): void
    {
        $project = $deployment->project;
        $log = [];

        try {
            $artifacts = $deployment->artifacts;

            if ($artifacts->isEmpty()) {
                throw new \Exception('No artifacts received');
            }

            $extractDir = $this->getExtractDirectory($deployment);
            $this->ensureDirectoryExists($extractDir);

            foreach ($artifacts as $artifact) {
                $this->extractArtifact($artifact, $extractDir);
            }

            $pathsToDeploy = $this->getDeployPaths($project);

            if (empty($pathsToDeploy)) {
                throw new \Exception('No deploy paths configured');
            }

            foreach ($pathsToDeploy as $deployPath) {
                $this->ensureDirectoryExists($deployPath);
                $this->copyExtractedFiles($extractDir, $deployPath, $log);
            }

            $this->cleanupExtractDirectory($extractDir);

            $deployment->update([
                'status' => Deployment::STATUS_SUCCESS,
                'completed_at' => now(),
                'log' => implode("\n", $log),
            ]);

            Log::info("Deployment {$deployment->id} completed successfully");
            $this->notifyUser($deployment);

        } catch (\Exception $e) {
            $log[] = 'ERROR: '.$e->getMessage();
            $deployment->update([
                'status' => Deployment::STATUS_FAILED,
                'completed_at' => now(),
                'log' => implode("\n", $log),
            ]);

            Log::error("Deployment {$deployment->id} failed: ".$e->getMessage());
            $this->notifyUser($deployment);
        }
    }

    public function notifyUser(Deployment $deployment): void
    {
        $project = $deployment->project;
        $user = $project->user;

        if (! $user) {
            return;
        }

        $notifySuccess = $user->notify_deployment_success;
        $notifyFailure = $user->notify_deployment_failure;

        if ($deployment->isSuccess() && $notifySuccess) {
            Mail::to($user->email)->send(new DeploymentSuccessMail($deployment));
        } elseif ($deployment->isFailed() && $notifyFailure) {
            Mail::to($user->email)->send(new DeploymentFailedMail($deployment));
        }
    }

    private function saveArtifact(Deployment $deployment, UploadedFile $artifact): Artifact
    {
        $storagePath = storage_path("app/artifacts/{$deployment->id}");
        $this->ensureDirectoryExists($storagePath);

        $filename = $artifact->getClientOriginalName();
        $path = $artifact->storeAs("artifacts/{$deployment->id}", $filename);

        return Artifact::create([
            'project_id' => $deployment->project_id,
            'deployment_id' => $deployment->id,
            'file_path' => $path,
            'file_size' => $artifact->getSize(),
        ]);
    }

    private function extractArtifact(Artifact $artifact, string $extractDir): void
    {
        $fullPath = storage_path("app/{$artifact->file_path}");

        if (! File::exists($fullPath)) {
            throw new \Exception("Artifact file not found: {$artifact->file_path}");
        }

        $zip = new ZipArchive;
        $result = $zip->open($fullPath);

        if ($result !== true) {
            throw new \Exception("Failed to open artifact zip: {$artifact->file_path}");
        }

        $realDestination = realpath($extractDir);

        for ($i = 0; $i < $zip->numFiles; $i++) {
            $entryName = $zip->getNameIndex($i);
            $entryDest = realpath($extractDir.DIRECTORY_SEPARATOR.$entryName);

            if ($entryDest === false) {
                $entryDest = $extractDir.DIRECTORY_SEPARATOR.$entryName;
            }

            $normalised = str_replace('\\', '/', $entryDest);
            $base = str_replace('\\', '/', $realDestination);

            if (! str_starts_with($normalised, $base.'/') && $normalised !== $base) {
                $zip->close();
                throw new \Exception("Zip slip detected: entry '{$entryName}' would extract outside destination.");
            }
        }

        $zip->extractTo($extractDir);
        $zip->close();

        Log::info("Extracted artifact {$artifact->id} to {$extractDir}");
    }

    private function getDeployPaths(Project $project): array
    {
        $paths = [];

        $deployPath = $project->deploy_path;
        if (! empty($deployPath)) {
            if (! $this->isPathSafe($deployPath)) {
                throw new \RuntimeException("Deploy path '{$deployPath}' is not permitted.");
            }
            $paths[] = $deployPath;
        }

        if ($project->hasTwoArtifacts() && ! empty($project->app_root_path)) {
            if (! $this->isPathSafe($project->app_root_path)) {
                throw new \RuntimeException("App root path '{$project->app_root_path}' is not permitted.");
            }
            $paths[] = $project->app_root_path;
        }

        return $paths;
    }

    private function isPathSafe(string $path): bool
    {
        $virelRoot = realpath(base_path());
        $resolved = realpath($path) ?: $path;

        if ($virelRoot && str_starts_with($resolved, $virelRoot)) {
            return false;
        }

        if (str_contains($path, '..') || str_contains($path, '~')) {
            return false;
        }

        return true;
    }

    private function getExtractDirectory(Deployment $deployment): string
    {
        return storage_path("app/extracted/{$deployment->id}");
    }

    private function ensureDirectoryExists(string $path): void
    {
        if (! File::exists($path)) {
            File::makeDirectory($path, 0755, true);
        }
    }

    private function copyExtractedFiles(string $source, string $destination, array &$log): void
    {
        $files = File::allFiles($source);

        foreach ($files as $file) {
            $relativePath = $file->getRelativePathname();
            $targetPath = $destination.'/'.$relativePath;

            $targetDir = dirname($targetPath);
            if (! File::exists($targetDir)) {
                File::makeDirectory($targetDir, 0755, true);
            }

            if ($file->isDir()) {
                if (! File::exists($targetPath)) {
                    File::makeDirectory($targetPath, 0755, true);
                }
            } else {
                if (File::exists($targetPath)) {
                    File::delete($targetPath);
                }
                File::copy($file->getPathname(), $targetPath);
            }
        }

        $log[] = "Copied files from {$source} to {$destination}";
    }

    private function cleanupExtractDirectory(string $path): void
    {
        if (File::exists($path)) {
            File::deleteDirectory($path);
        }
    }
}
