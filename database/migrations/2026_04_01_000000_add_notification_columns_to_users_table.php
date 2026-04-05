<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('notify_deployment_success')->default(false)->after('is_github_account');
            $table->boolean('notify_deployment_failure')->default(false)->after('notify_deployment_success');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['notify_deployment_success', 'notify_deployment_failure']);
        });
    }
};
