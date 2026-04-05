<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->string('framework_type')->after('is_active')->nullable();
            $table->string('app_root_path', 500)->after('framework_type')->nullable();
            $table->string('github_hook_id')->after('app_root_path')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['framework_type', 'app_root_path', 'github_hook_id']);
        });
    }
};
