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
        // Drop existing tables if they exist
        Schema::dropIfExists('table_reservations');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('menu_categories');
        Schema::dropIfExists('menu_modifiers');
        Schema::dropIfExists('menu_combos');
        Schema::dropIfExists('combo_items');
        Schema::dropIfExists('customer_loyalty_points');
        Schema::dropIfExists('promotions');

        // Recreate tables without customer foreign keys
        Schema::create('table_reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('table_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('customer_id')->nullable();
            $table->string('customer_name');
            $table->string('customer_phone')->nullable();
            $table->string('customer_email')->nullable();
            $table->integer('number_of_guests');
            $table->dateTime('reservation_time');
            $table->dateTime('estimated_arrival_time')->nullable();
            $table->integer('estimated_duration_minutes')->default(120);
            $table->text('special_requests')->nullable();
            $table->enum('status', ['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'])->default('pending');
            $table->decimal('deposit_amount', 8, 2)->default(0);
            $table->string('payment_status')->default('pending');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            
            $table->index(['table_id', 'reservation_time']);
            $table->index(['status', 'reservation_time']);
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('reservation_id')->nullable()->constrained()->onDelete('set null');
            $table->decimal('amount', 10, 2);
            $table->enum('payment_method', ['cash', 'card', 'mobile', 'qr_code', 'bank_transfer', 'digital_wallet'])->default('cash');
            $table->string('payment_gateway')->nullable();
            $table->string('transaction_id')->nullable();
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'refunded'])->default('pending');
            $table->text('payment_details')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('processed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            
            $table->index(['order_id', 'status']);
            $table->index(['reservation_id', 'status']);
        });

        Schema::create('menu_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('image_url')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->unique(['name']);
            $table->index(['is_active', 'sort_order']);
        });

        Schema::create('menu_modifiers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('price_adjustment', 8, 2)->default(0);
            $table->enum('modifier_type', ['add', 'remove', 'replace'])->default('add');
            $table->foreignId('menu_item_id')->constrained()->onDelete('cascade');
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            
            $table->index(['menu_item_id', 'is_active']);
        });

        Schema::create('menu_combos', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('combo_price', 10, 2);
            $table->decimal('savings_amount', 8, 2)->default(0);
            $table->string('image_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            
            $table->index(['is_active', 'sort_order']);
        });

        Schema::create('combo_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_combo_id')->constrained()->onDelete('cascade');
            $table->foreignId('menu_item_id')->constrained()->onDelete('cascade');
            $table->integer('quantity')->default(1);
            $table->boolean('is_required')->default(true);
            $table->timestamps();
            
            $table->unique(['menu_combo_id', 'menu_item_id']);
        });

        Schema::create('customer_loyalty_points', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('customer_id');
            $table->integer('points_earned')->default(0);
            $table->integer('points_redeemed')->default(0);
            $table->integer('points_balance')->default(0);
            $table->decimal('total_spent', 10, 2)->default(0);
            $table->integer('visits_count')->default(0);
            $table->date('last_visit_date')->nullable();
            $table->timestamps();
            
            $table->unique(['customer_id']);
        });

        Schema::create('promotions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('discount_type', ['percentage', 'fixed_amount', 'buy_one_get_one', 'free_item'])->default('percentage');
            $table->decimal('discount_value', 8, 2)->default(0);
            $table->decimal('minimum_order_amount', 8, 2)->nullable();
            $table->dateTime('start_time');
            $table->dateTime('end_time');
            $table->boolean('is_active')->default(true);
            $table->integer('usage_limit')->nullable();
            $table->integer('usage_count')->default(0);
            $table->json('applicable_items')->nullable();
            $table->json('conditions')->nullable();
            $table->timestamps();
            
            $table->index(['is_active', 'start_time', 'end_time']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promotions');
        Schema::dropIfExists('customer_loyalty_points');
        Schema::dropIfExists('combo_items');
        Schema::dropIfExists('menu_combos');
        Schema::dropIfExists('menu_modifiers');
        Schema::dropIfExists('menu_categories');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('table_reservations');
    }
};
