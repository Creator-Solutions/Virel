<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('environment_variables', function (Blueprint $table) {
            $table->string('environment', 50)->after('key')->default('production');
            $table->dropUnique(['project_id', 'key']);
            $table->unique(['project_id', 'key', 'environment']);
        });
    }

    public function down(): void
    {
        Schema::table('environment_variables', function (Blueprint $table) {
            $table->dropUnique(['project_id', 'key', 'environment']);
            $table->dropColumn('environment');
            $table->unique(['project_id', 'key']);
        });
    }
};
