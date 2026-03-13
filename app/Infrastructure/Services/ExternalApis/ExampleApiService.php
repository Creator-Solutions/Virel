<?php

namespace App\Infrastructure\Services\ExternalApis;

use Illuminate\Support\Facades\Http;

class ExampleApiService
{
    private string $baseUrl;
    private ?string $apiKey;

    public function __construct()
    {
        $this->baseUrl = config('services.example_api.url', 'https://api.example.com');
        $this->apiKey = config('services.example_api.key');
    }

    public function get(string $endpoint, array $queryParams = []): array
    {
        $response = Http::withHeaders($this->getHeaders())
            ->get("{$this->baseUrl}/{$endpoint}", $queryParams);

        return $response->json();
    }

    public function post(string $endpoint, array $data = []): array
    {
        $response = Http::withHeaders($this->getHeaders())
            ->post("{$this->baseUrl}/{$endpoint}", $data);

        return $response->json();
    }

    public function put(string $endpoint, array $data = []): array
    {
        $response = Http::withHeaders($this->getHeaders())
            ->put("{$this->baseUrl}/{$endpoint}", $data);

        return $response->json();
    }

    public function delete(string $endpoint): bool
    {
        $response = Http::withHeaders($this->getHeaders())
            ->delete("{$this->baseUrl}/{$endpoint}");

        return $response->successful();
    }

    private function getHeaders(): array
    {
        $headers = [
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ];

        if ($this->apiKey !== null) {
            $headers['Authorization'] = "Bearer {$this->apiKey}";
        }

        return $headers;
    }
}
