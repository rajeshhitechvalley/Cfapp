<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tables', function (Blueprint $table) {
            $table->id();
            $table->string('table_number')->unique();
            $table->string('name')->nullable();
            $table->foreignId('table_type_id')->constrained()->onDelete('cascade');
            $table->integer('capacity')->default(4);
            $table->integer('min_capacity')->default(1);
            $table->string('location')->nullable();
            $table->text('description')->nullable();
            $table->json('position')->nullable();
            $table->enum('status', ['available', 'reserved', 'occupied', 'maintenance'])->default('available');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tables');
    }
};
