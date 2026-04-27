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
        $trigger = $triggeredBy
            ? Deployment::TRIGGER_WORKFLOW
            : Deployment::TRIGGER_WEBHOOK;

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
            $this->writeLog($log, 'ERROR: '.$e->getMessage());
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

    private function deployArtifact(Project $project, string $extractDir, array &$log): void
    {
        $artifactDir = $extractDir.'/artifact';

        if (! File::exists($artifactDir)) {
            $artifactDir = $extractDir;
            $this->writeLog($log, 'No artifact/ wrapper found, using extract root');
        }

        $publicHtmlSource = $artifactDir.'/public_html';
        $appRootSource = $artifactDir.'/app_root';

        if (! File::exists($publicHtmlSource)) {
            $contents = File::exists($artifactDir)
                ? implode(', ', array_map('basename', File::directories($artifactDir)))
                : 'none';
            throw new \RuntimeException(
                "Artifact is missing required public_html/ directory. Found: {$contents}"
            );
        }

        if (! $this->isPathSafe($project->deploy_path)) {
            throw new \RuntimeException("Deploy path '{$project->deploy_path}' is not permitted.");
        }

        $this->ensureDirectoryExists($project->deploy_path);
        $this->syncDirectory($publicHtmlSource, $project->deploy_path, $log);
        $this->writeLog($log, "Deployed public_html → {$project->deploy_path}");

        $buildSource = $publicHtmlSource.'/build';

        if ($project->framework_type === 'laravel') {
            if (empty($project->app_root_path)) {
                throw new \RuntimeException('Laravel project is missing app_root_path configuration.');
            }

            if (! File::exists($appRootSource)) {
                throw new \RuntimeException('Artifact is missing required app_root/ directory for Laravel project.');
            }

            if (! $this->isPathSafe($project->app_root_path)) {
                throw new \RuntimeException("App root path '{$project->app_root_path}' is not permitted.");
            }

            $this->ensureDirectoryExists($project->app_root_path);
            $this->syncDirectory($appRootSource, $project->app_root_path, $log);
            $this->writeLog($log, "Deployed app_root → {$project->app_root_path}");

            $publicBuildFolder = rtrim($project->app_root_path, '/').'/public/build';
            $this->ensureDirectoryExists($publicBuildFolder);
            if (File::exists($buildSource)) {
                $this->syncDirectory($buildSource, $publicBuildFolder, $log);
                $this->writeLog($log, "Deployed build → {$publicBuildFolder}");
            }

            $this->patchIndexPhp($project, $log);
            $this->writeEnvFile($project, $log);
        }

        if ($project->framework_type === 'react-vite') {
            $project->load('environmentVariables');
            if ($project->environmentVariables->isNotEmpty()) {
                $this->writeEnvFile($project, $log);
            }
        }
    }

    private function patchIndexPhp(Project $project, array &$log): void
    {
        $indexPath = $project->deploy_path.'/index.php';

        if (! File::exists($indexPath)) {
            $this->writeLog($log, "WARNING: index.php not found at {$indexPath} — skipping patch");

            return;
        }

        $projectName = basename(rtrim($project->app_root_path, '/'));

        $patched = <<<PHP
<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

\$laravelRoot = dirname(__DIR__) . '/{$projectName}';

if (file_exists(\$maintenance = \$laravelRoot . '/storage/framework/maintenance.php')) {
    require \$maintenance;
}

require \$laravelRoot . '/vendor/autoload.php';

/** @var Application \$app */
\$app = require_once \$laravelRoot . '/bootstrap/app.php';

\$app->handleRequest(Request::capture());
PHP;

        File::put($indexPath, $patched);
        $this->writeLog($log, "Patched index.php → laravel_root: {$projectName}");
    }

    private function writeEnvFile(Project $project, array &$log): void
    {
        $envDir = $project->framework_type === 'laravel'
            ? $project->app_root_path
            : $project->deploy_path;

        if (empty($envDir)) {
            $this->writeLog($log, 'WARNING: Cannot write .env — deploy path not configured');

            return;
        }

        $envPath = rtrim($envDir, '/').'/.env';
        $examplePath = rtrim($envDir, '/').'/.env.example';

        if (! File::exists($examplePath)) {
            $this->generateEnvExample($project, $examplePath, $log);
        }

        $envLines = file($examplePath, FILE_IGNORE_NEW_LINES) ?: [];
        $this->writeLog($log, 'Loaded .env.example as base template');

        $existingKeys = [];
        foreach ($envLines as $line) {
            if (str_contains($line, '=') && ! str_starts_with(trim($line), '#')) {
                [$key] = explode('=', $line, 2);
                $existingKeys[trim($key)] = true;
            }
        }

        if ($project->framework_type === 'laravel' && ! empty($project->public_url)) {
            $appUrl = rtrim($project->public_url, '/');
            if (isset($existingKeys['APP_URL'])) {
                foreach ($envLines as $i => $line) {
                    if (str_starts_with($line, 'APP_URL=')) {
                        $envLines[$i] = "APP_URL={$appUrl}";
                        break;
                    }
                }
            } else {
                $envLines[] = "APP_URL={$appUrl}";
            }
            $existingKeys['APP_URL'] = true;
            $this->writeLog($log, "Set APP_URL to {$appUrl}");
        }

        $project->load('environmentVariables');

        foreach ($project->environmentVariables as $envVar) {
            try {
                $key = $envVar->key;
                $value = $envVar->value;

                if (preg_match('/[\s#"\'\\\\]/', $value)) {
                    $value = '"'.addslashes($value).'"';
                }

                if (isset($existingKeys[$key])) {
                    foreach ($envLines as $i => $line) {
                        if (str_starts_with($line, $key.'=')) {
                            $envLines[$i] = "{$key}={$value}";
                            break;
                        }
                    }
                } else {
                    $envLines[] = "{$key}={$value}";
                }

                $existingKeys[$key] = true;
            } catch (\Exception $e) {
                $this->writeLog($log, "WARNING: Could not decrypt env variable {$envVar->key} — skipping");
            }
        }

        File::put($envPath, implode(PHP_EOL, $envLines).PHP_EOL);
        $this->writeLog($log, "Written .env to {$envPath} with ".count($project->environmentVariables).' environment variables');
    }

    private function generateEnvExample(Project $project, string $examplePath, array &$log): void
    {
        $template = match ($project->framework_type) {
            'laravel' => $this->getLaravelEnvExample(),
            'react-vite' => $this->getReactEnvExample(),
            default => $this->getLaravelEnvExample(),
        };

        File::put($examplePath, $template);
        $this->writeLog($log, "Generated .env.example template for {$project->framework_type}");
    }

    private function getLaravelEnvExample(): string
    {
        return <<<'ENV'
APP_NAME=Virel
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=http://localhost

LOG_CHANNEL=stack
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=virel
DB_USERNAME=root
DB_PASSWORD=

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

VITE_APP_URL="${APP_URL}"
ENV;
    }

    private function getReactEnvExample(): string
    {
        return <<<'ENV'
VITE_APP_NAME=Virel
VITE_API_URL=http://localhost/api
VITE_APP_URL=http://localhost
NODE_ENV=production
ENV;
    }

    private function writeLog(array &$log, string $message): void
    {
        $line = '['.now()->toDateTimeString().'] '.$message;
        $log[] = $line;
    }

    private function syncDirectory(string $source, string $destination, array &$log): void
    {
        $files = File::allFiles($source);

        foreach ($files as $file) {
            $relativePath = $file->getRelativePathname();
            $destPath = rtrim($destination, '/').'/'.$relativePath;

            $destDir = dirname($destPath);
            if (! File::exists($destDir)) {
                File::makeDirectory($destDir, 0755, true);
            }

            if (File::exists($destPath)) {
                File::delete($destPath);
            }
            File::copy($file->getPathname(), $destPath);
        }

        $dirs = File::allDirectories($source);
        foreach ($dirs as $dir) {
            $relativeDir = str_replace($source.'/', '', $dir);
            $destDir = rtrim($destination, '/').'/'.$relativeDir;
            File::ensureDirectoryExists($destDir);
        }

        $this->writeLog($log, 'Synced '.count($files)." files from {$source} to {$destination}");
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
