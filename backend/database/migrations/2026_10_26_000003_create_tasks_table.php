<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('status')->default('draft')->index();
            $table->string('priority')->default('medium')->index();
            $table->foreignId('division_id')->index()->constrained()->cascadeOnDelete();
            $table->foreignId('creator_id')->index()->constrained('users')->cascadeOnDelete();
            $table->foreignId('pic_id')->nullable()->index()->constrained('users')->nullOnDelete();
            $table->date('due_date')->nullable()->index();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
