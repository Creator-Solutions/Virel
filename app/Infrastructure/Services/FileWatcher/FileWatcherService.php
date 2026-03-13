<?php

namespace App\Infrastructure\Services\FileWatcher;

class FileWatcherService
{
    private array $watchedFiles = [];
    private ?int $lastModified = null;

    public function watch(string $filePath): bool
    {
        if (!file_exists($filePath)) {
            return false;
        }

        $currentModified = filemtime($filePath);
        
        if ($this->lastModified !== null && $currentModified > $this->lastModified) {
            return true;
        }

        $this->lastModified = $currentModified;
        $this->watchedFiles[$filePath] = $currentModified;
        
        return false;
    }

    public function getWatchedFiles(): array
    {
        return array_keys($this->watchedFiles);
    }

    public function hasChanges(string $filePath): bool
    {
        if (!isset($this->watchedFiles[$filePath])) {
            return false;
        }

        $currentModified = filemtime($filePath);
        
        return $currentModified > $this->watchedFiles[$filePath];
    }

    public function clear(): void
    {
        $this->watchedFiles = [];
        $this->lastModified = null;
    }
}
