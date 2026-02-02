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
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('users')->nullOnDelete();
            
            $table->index(['created_by']);
            $table->index(['assigned_to']);
            $table->index(['customer_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropForeign(['assigned_to']);
            $table->dropForeign(['customer_id']);
            $table->dropIndex(['created_by']);
            $table->dropIndex(['assigned_to']);
            $table->dropIndex(['customer_id']);
            $table->dropColumn(['created_by', 'assigned_to', 'customer_id']);
        });
    }
};
