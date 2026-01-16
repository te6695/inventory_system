<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('inventory_transactions', function (Blueprint $table) {
            $table->enum('type', ['purchase', 'sale', 'return', 'adjustment', 'transfer'])->default('purchase');
            $table->decimal('total_amount', 10, 2)->default(0);
        });
    }

    public function down()
    {
        Schema::table('inventory_transactions', function (Blueprint $table) {
            $table->dropColumn(['type', 'total_amount']);
        });
    }
};