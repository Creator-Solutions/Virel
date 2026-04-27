<?php

namespace App\Services;

use App\Infrastructure\Persistence\Models\EnvironmentVariable;
use App\Infrastructure\Persistence\Models\Project;
use Illuminate\Support\Facades\Log;
use PDO;

class DatabaseImportService
{
    public function import(Project $project, string $sqlFile): void
    {
        $requiredKeys = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST'];
        $envVars = EnvironmentVariable::where('project_id', $project->id)
            ->whereIn('key', $requiredKeys)
            ->get()
            ->keyBy('key');

        foreach ($requiredKeys as $key) {
            if (!$envVars->has($key)) {
                throw new \Exception("Missing required environment variable: {$key}");
            }
        }

        $dbHost = $envVars['DB_HOST']->value;
        $dbName = $envVars['DB_NAME']->value;
        $dbUser = $envVars['DB_USER']->value;
        $dbPass = $envVars['DB_PASSWORD']->value;

        if (!file_exists($sqlFile)) {
            throw new \RuntimeException("SQL file not found: {$sqlFile}");
        }

        $sql = file_get_contents($sqlFile);
        $sql = $this->removeComments($sql);
        $sql = $this->replacePrefix($sql, $project);

        $dsn = "mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];

        $pdo = new PDO($dsn, $dbUser, $dbPass, $options);

        $this->executeStatements($pdo, $sql);

        Log::info("Database imported for project {$project->id}");
    }

    private function removeComments(string $sql): string
    {
        $lines = explode("\n", $sql);
        $result = [];

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;
            if (str_starts_with($line, '--')) continue;
            if (str_starts_with($line, '//')) continue;
            $result[] = $line;
        }

        $sql = implode("\n", $result);

        $sql = preg_replace('/\/\*.*?\*\//s', '', $sql);
        $sql = preg_replace('/\s+/', ' ', $sql);

        return $sql;
    }

    private function replacePrefix(string $sql, Project $project): string
    {
        $dbPrefix = 'wp_';
        $envVar = EnvironmentVariable::where('project_id', $project->id)
            ->where('key', 'DB_PREFIX')
            ->first();

        if ($envVar && $envVar->value) {
            $dbPrefix = $envVar->value;
        }

        if ($dbPrefix === 'wp_') {
            return $sql;
        }

        return str_replace('wp_', $dbPrefix, $sql);
    }

    private function executeStatements(PDO $pdo, string $sql): void
    {
        $statements = explode(';', $sql);

        $pdo->beginTransaction();

        try {
            foreach ($statements as $statement) {
                $statement = trim($statement);
                if (empty($statement)) continue;

                $pdo->exec($statement);
            }

            $pdo->commit();
        } catch (\Exception $e) {
            $pdo->rollBack();
            throw $e;
        }
    }
}