<?php

namespace App\Services;

use App\Infrastructure\Persistence\Models\Artifact;
use App\Infrastructure\Persistence\Models\Deployment;
use App\Infrastructure\Persistence\Models\EnvironmentVariable;
use App\Infrastructure\Persistence\Models\Project;
use App\Infrastructure\Persistence\Models\Setting;
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
    ?string $commitMessage = null,
    ?string $triggeredBy = null,
    ): Deployment {
        $deployment = Deployment::create([
            'project_id'     => $project->id,
            'status'         => Deployment::STATUS_RUNNING,
            'trigger'        => Deployment::TRIGGER_WORKFLOW,
            'triggered_by'   => null, // foreign key to users — not applicable for workflow triggers
            'commit_sha'     => $commitSha,
            'commit_message' => $commitMessage,
            'started_at'     => now(),
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

            if ($project->framework_type === 'wordpress') {
                $this->configureWordPress($project, $extractDir, $log);
            }

            $sourcePath = $this->getArtifactSourcePath($project, $extractDir);
            $pathsToDeploy = $this->getDeployPaths($project);

            if (empty($pathsToDeploy)) {
                throw new \Exception('No deploy paths configured');
            }

            foreach ($pathsToDeploy as $deployPath) {
                $this->ensureDirectoryExists($deployPath);
                $this->copyExtractedFiles($sourcePath, $deployPath, $log);
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

        $mailHost = Setting::get('MAIL_HOST');

        if (empty($mailHost)) {
            Log::warning('No mail settings configured, skipping notification.');

            return;
        }

        $mailSettings = [
            'MAIL_HOST' => $mailHost,
            'MAIL_PORT' => Setting::get('MAIL_PORT'),
            'MAIL_USERNAME' => Setting::get('MAIL_USERNAME'),
            'MAIL_PASSWORD' => Setting::get('MAIL_PASSWORD'),
            'MAIL_ENCRYPTION' => Setting::get('MAIL_ENCRYPTION', 'tls'),
            'MAIL_FROM_ADDRESS' => Setting::get('MAIL_FROM_ADDRESS'),
            'MAIL_FROM_NAME' => Setting::get('MAIL_FROM_NAME'),
        ];

        config([
            'mail.mailers.smtp.host' => $mailSettings['MAIL_HOST'],
            'mail.mailers.smtp.port' => (int) $mailSettings['MAIL_PORT'],
            'mail.mailers.smtp.username' => $mailSettings['MAIL_USERNAME'],
            'mail.mailers.smtp.password' => $mailSettings['MAIL_PASSWORD'],
            'mail.mailers.smtp.encryption' => $mailSettings['MAIL_ENCRYPTION'] === 'none' ? null : $mailSettings['MAIL_ENCRYPTION'],
            'mail.from.address' => $mailSettings['MAIL_FROM_ADDRESS'],
            'mail.from.name' => $mailSettings['MAIL_FROM_NAME'],
        ]);

        $notifySuccess = $user->notify_deployment_success;
        $notifyFailure = $user->notify_deployment_failure;

        if ($deployment->isSuccess() && $notifySuccess) {
            try {
                Mail::to($user->email)->send(new DeploymentSuccessMail($deployment));
            }
            catch (\Exception $e) {
                report($e);
            }
        }
        elseif ($deployment->isFailed() && $notifyFailure) {
            try {
                Mail::to($user->email)->send(new DeploymentFailedMail($deployment));
            }
            catch (\Exception $e) {
                report($e);
            }
        }
    }

    private function saveArtifact(Deployment $deployment, UploadedFile $artifact): Artifact
    {
        $directory = storage_path("app/artifacts/{$deployment->id}");
        $this->ensureDirectoryExists($directory);

        $filename  = 'virel-deploy.zip';
        $fullPath  = $directory . '/' . $filename;
        $filePath  = "artifacts/{$deployment->id}/{$filename}";

        // Use move() directly instead of storeAs() — more reliable on shared hosting
        $artifact->move($directory, $filename);

        if (!file_exists($fullPath)) {
            throw new \Exception("Failed to save artifact to disk: {$fullPath}");
        }

        Log::info("Artifact saved", [
            'path'    => $fullPath,
            'exists'  => file_exists($fullPath),
            'size'    => filesize($fullPath),
        ]);

        return Artifact::create([
            'project_id'    => $deployment->project_id,
            'deployment_id' => $deployment->id,
            'file_path'     => $filePath,
            'file_size'     => filesize($fullPath),
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

        if ($zip->numFiles === 0) {
            $zip->close();
            throw new \Exception('ZIP archive is empty or contains no valid entries.');
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
        $resolved  = realpath($path) ?: $path;

        // Add trailing slash to prevent false prefix matches
        // e.g. /home/user/vrey.domain.co.za should NOT match /home/user/vrey
        if ($virelRoot && str_starts_with($resolved . '/', $virelRoot . '/')) {
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

    private function getArtifactSourcePath(Project $project, string $extractDir): string
    {
        return match ($project->framework_type) {
            'react-vite' => $extractDir . '/artifact/public_html',
            'wordpress' => $extractDir . '/artifact/public_html',
            'laravel'   => $extractDir,
            default    => $extractDir,
        };
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

    private function configureWordPress(Project $project, string $extractDir, array &$log): void
    {
        $requiredKeys = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST'];
        $envVars = EnvironmentVariable::where('project_id', $project->id)
            ->whereIn('key', $requiredKeys)
            ->get()
            ->keyBy('key');

        foreach ($requiredKeys as $key) {
            if (!$envVars->has($key)) {
                throw new \Exception("Missing required environment variable: {$key}. Configure database credentials in project settings.");
            }
        }

        $dbHost = $envVars['DB_HOST']->value;
        $dbName = $envVars['DB_NAME']->value;
        $dbUser = $envVars['DB_USER']->value;
        $dbPass = $envVars['DB_PASSWORD']->value;
        $dbPrefix = $envVars['DB_PREFIX']->value ?? 'wp_';

        $artifactRoot = $extractDir . '/artifact/public_html';

        $envContent = "DB_NAME={$dbName}\n"
            . "DB_USER={$dbUser}\n"
            . "DB_PASSWORD={$dbPass}\n"
            . "DB_HOST={$dbHost}\n"
            . "DB_PREFIX={$dbPrefix}\n";

        File::put("{$artifactRoot}/.env", $envContent);
        $log[] = "Created .env file with database credentials";

        $wpConfigPath = $artifactRoot . '/wp-config.php';

        if (!File::exists($wpConfigPath)) {
            $this->generateWpConfig($artifactRoot, $dbName, $dbUser, $dbPass, $dbHost, $dbPrefix, $log);
        } else {
            $this->patchWpConfig($artifactRoot, $dbName, $dbUser, $dbPass, $dbHost, $dbPrefix, $log);
        }
    }

    private function generateWpConfig(
        string $artifactRoot,
        string $dbName,
        string $dbUser,
        string $dbPass,
        string $dbHost,
        string $dbPrefix,
        array &$log
    ): void {
        $wpConfigPath = $artifactRoot . '/wp-config.php';

        $lines = [
            "<?php",
            "/**",
            " * Virel auto-generated WordPress configuration",
            " */",
            "",
            "define('DB_NAME', '" . addslashes($dbName) . "');",
            "define('DB_USER', '" . addslashes($dbUser) . "');",
            "define('DB_PASSWORD', '" . addslashes($dbPass) . "');",
            "define('DB_HOST', '" . addslashes($dbHost) . "');",
            "define('DB_CHARSET', 'utf8mb4');",
            "define('DB_COLLATE', '');",
            "",
            "\$table_prefix = '" . addslashes($dbPrefix) . "';",
            "",
            "define('WP_DEBUG', false);",
            "",
            "define('AUTOSAVE_INTERVAL', 160);",
            "define('WP_POST_REVISIONS', false);",
            "define('WP_CRON', true);",
            "",
            "if (!defined('ABSPATH')) {",
            "    define('ABSPATH', __DIR__ . '/');",
            "}",
            "",
            "require_once ABSPATH . 'wp-settings.php';",
        ];

        File::put($wpConfigPath, implode("\n", $lines));
        $log[] = "Generated wp-config.php";
    }

    private function patchWpConfig(
        string $artifactRoot,
        string $dbName,
        string $dbUser,
        string $dbPass,
        string $dbHost,
        string $dbPrefix,
        array &$log
    ): void {
        $wpConfigPath = $artifactRoot . '/wp-config.php';
        $content = File::get($wpConfigPath);

        $replacements = [
            ['pattern' => "define( 'DB_NAME'", 'replacement' => "define( 'DB_NAME', '" . addslashes($dbName) . "' );"],
            ['pattern' => "define('DB_NAME'", 'replacement' => "define('DB_NAME', '" . addslashes($dbName) . "' );"],
            ['pattern' => "define( 'DB_USER'", 'replacement' => "define( 'DB_USER', '" . addslashes($dbUser) . "' );"],
            ['pattern' => "define('DB_USER'", 'replacement' => "define('DB_USER', '" . addslashes($dbUser) . "' );"],
            ['pattern' => "define( 'DB_PASSWORD'", 'replacement' => "define( 'DB_PASSWORD', '" . addslashes($dbPass) . "' );"],
            ['pattern' => "define('DB_PASSWORD'", 'replacement' => "define('DB_PASSWORD', '" . addslashes($dbPass) . "' );"],
            ['pattern' => "define( 'DB_HOST'", 'replacement' => "define( 'DB_HOST', '" . addslashes($dbHost) . "' );"],
            ['pattern' => "define('DB_HOST'", 'replacement' => "define('DB_HOST', '" . addslashes($dbHost) . "' );"],
            ['pattern' => '$table_prefix', 'replacement' => '$table_prefix = \'' . addslashes($dbPrefix) . '\';'],
        ];

        foreach ($replacements as $item) {
            if (stripos($content, $item['pattern']) !== false) {
                $content = preg_replace(
                    '/' . preg_quote($item['pattern'], '/') . '[\s\S]*?;/',
                    $item['replacement'],
                    $content
                );
            }
        }

        File::put($wpConfigPath, $content);
        $log[] = "Patched wp-config.php with database credentials";
    }
}
