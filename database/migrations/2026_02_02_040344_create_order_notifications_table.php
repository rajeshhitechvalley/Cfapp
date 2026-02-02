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
        Schema::create('order_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type'); // 'new_order', 'status_change', 'priority_change', 'assigned', 'ready', 'cancelled'
            $table->string('title');
            $table->text('message');
            $table->json('data')->nullable(); // Additional notification data
            $table->string('target_role'); // 'staff', 'kitchen', 'reception', 'all'
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            
            $table->index(['order_id', 'type']);
            $table->index(['user_id', 'is_read']);
            $table->index(['target_role', 'is_read']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_notifications');
    }
};
