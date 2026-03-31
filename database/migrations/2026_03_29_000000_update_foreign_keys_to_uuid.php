<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('deployments', function (Blueprint $table) {
            $table->dropForeign(['triggered_by']);
            $table->dropColumn('triggered_by');
            $table->foreignUuid('triggered_by')->nullable()->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
            $table->foreignUlid('user_id')->after('id')->constrained('users')->cascadeOnDelete();
        });

        Schema::table('deployments', function (Blueprint $table) {
            $table->dropForeign(['triggered_by']);
            $table->dropColumn('triggered_by');
            $table->foreignUlid('triggered_by')->nullable()->constrained('users')->nullOnDelete();
        });
    }
};
