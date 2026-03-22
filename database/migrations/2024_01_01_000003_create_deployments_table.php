<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deployments', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('project_id')->constrained('projects')->cascadeOnDelete();
            $table->enum('status', ['pending', 'running', 'success', 'failed'])->default('pending');
            $table->enum('trigger', ['manual', 'webhook']);
            $table->foreignUlid('triggered_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('commit_sha', 40)->nullable();
            $table->string('branch')->nullable();
            $table->longText('log')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deployments');
    }
};
