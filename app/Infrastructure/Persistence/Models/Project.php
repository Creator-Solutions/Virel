<?php

namespace App\Infrastructure\Persistence\Models;

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;

class Project extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'user_id',
        'name',
        'environment',
        'deploy_path',
        'public_url',
        'github_owner',
        'github_repo',
        'github_branch',
        'github_pat',
        'webhook_secret',
        'framework_type',
        'app_root_path',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'github_setup_pending' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function deployments(): HasMany
    {
        return $this->hasMany(Deployment::class);
    }

    public function latestDeployment(): HasOne
    {
        return $this->hasOne(Deployment::class)->latestOfMany('created_at');
    }

    public function recentDeployments()
    {
        return $this->deployments()->orderBy('created_at', 'desc')->limit(5);
    }

    public function recentArtifacts()
    {
        return $this->hasMany(Artifact::class)->orderBy('created_at', 'desc')->limit(5);
    }

    public function environmentVariables(): HasMany
    {
        return $this->hasMany(EnvironmentVariable::class);
    }

    public function hasGithubSetup(): bool
    {
        return ! empty($this->github_hook_id) && ! $this->github_setup_pending;
    }

    public function hasTwoArtifacts(): bool
    {
        return $this->framework_type === 'laravel';
    }

    public function getGithubPatAttribute(string $value): string
    {
        if (empty($value)) {
            return '';
        }

        try {
            return Crypt::decryptString($value);
        } catch (DecryptException $e) {
            Log::warning('Failed to decrypt github_pat. APP_KEY may have changed.', [
                'project_id' => $this->id,
            ]);

            return '****DECRYPTION_ERROR****';
        }
    }

    public function getWebhookSecretAttribute(string $value): string
    {
        if (empty($value)) {
            return '';
        }

        try {
            return Crypt::decryptString($value);
        } catch (DecryptException $e) {
            Log::warning('Failed to decrypt webhook_secret. APP_KEY may have changed.', [
                'project_id' => $this->id,
            ]);

            return '****DECRYPTION_ERROR****';
        }
    }

    public function setGithubPatAttribute(string $value): void
    {
        $this->attributes['github_pat'] = $value ? Crypt::encryptString($value) : '';
    }

    public function setWebhookSecretAttribute(string $value): void
    {
        $this->attributes['webhook_secret'] = $value ? Crypt::encryptString($value) : '';
    }
}
