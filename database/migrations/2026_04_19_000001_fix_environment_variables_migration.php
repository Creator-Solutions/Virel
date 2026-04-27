<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop foreign key first
        Schema::table('environment_variables', function (Blueprint $table) {
            $table->dropForeign(['project_id']);
        });

        // Drop old unique index
        DB::statement('ALTER TABLE environment_variables DROP INDEX environment_variables_project_id_key_unique');

        // Add environment column
        Schema::table('environment_variables', function (Blueprint $table) {
            $table->string('environment', 50)->after('key')->default('production');
        });

        // Add new composite unique index
        Schema::table('environment_variables', function (Blueprint $table) {
            $table->unique(['project_id', 'key', 'environment']);
        });

        // Re-add foreign key (without unique constraint on project_id)
        Schema::table('environment_variables', function (Blueprint $table) {
            $table->foreignUlid('project_id')->constrained('projects')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('environment_variables', function (Blueprint $table) {
            $table->dropForeign(['project_id']);
        });

        Schema::table('environment_variables', function (Blueprint $table) {
            $table->dropUnique(['project_id', 'key', 'environment']);
            $table->dropColumn('environment');
        });

        // Recreate original unique index
        DB::statement('ALTER TABLE environment_variables ADD UNIQUE environment_variables_project_id_key_unique (project_id, `key`)');

        // Re-add foreign key
        Schema::table('environment_variables', function (Blueprint $table) {
            $table->foreignUlid('project_id')->constrained('projects')->cascadeOnDelete();
        });
    }
};
