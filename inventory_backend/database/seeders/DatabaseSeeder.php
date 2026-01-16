<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        // Truncate tables
        User::truncate();
        Role::truncate();
        Category::truncate();
        Product::truncate();
        
        // Enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        // Create roles first
        $roles = [
            ['name' => 'admin', 'description' => 'System Administrator'],
            ['name' => 'manager', 'description' => 'Inventory Manager'],
            ['name' => 'staff', 'description' => 'Inventory Staff'],
        ];

        foreach ($roles as $role) {
            Role::create($role);
        }

        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@inventory.com',
            'password' => Hash::make('password'),
            'role_id' => 1,
            'is_active' => true,
        ]);

        // Create manager user
        User::create([
            'name' => 'Manager User',
            'email' => 'manager@inventory.com',
            'password' => Hash::make('password'),
            'role_id' => 2,
            'is_active' => true,
        ]);

        // Create staff user
        User::create([
            'name' => 'Staff User',
            'email' => 'staff@inventory.com',
            'password' => Hash::make('password'),
            'role_id' => 3,
            'is_active' => true,
        ]);

        // Create sample categories
        $categories = [
            ['name' => 'Electronics', 'description' => 'Electronic devices and accessories'],
            ['name' => 'Clothing', 'description' => 'Apparel and fashion items'],
            ['name' => 'Food & Beverages', 'description' => 'Food items and drinks'],
            ['name' => 'Books', 'description' => 'Books and stationery'],
            ['name' => 'Home & Garden', 'description' => 'Home and garden supplies'],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }

        // Create sample products (don't create stock here - it's done automatically)
        $products = [
            [
                'sku' => 'ELEC-001',
                'name' => 'Smartphone',
                'description' => 'Latest smartphone with advanced features',
                'category_id' => 1,
                'purchase_price' => 400.00,
                'selling_price' => 599.99,
                'reorder_level' => 10,
                'unit' => 'piece',
                'is_active' => true,
            ],
            [
                'sku' => 'CLOTH-001',
                'name' => 'T-Shirt',
                'description' => 'Cotton t-shirt, various sizes',
                'category_id' => 2,
                'purchase_price' => 8.50,
                'selling_price' => 19.99,
                'reorder_level' => 50,
                'unit' => 'piece',
                'is_active' => true,
            ],
            [
                'sku' => 'FOOD-001',
                'name' => 'Coffee Beans',
                'description' => 'Premium arabica coffee beans',
                'category_id' => 3,
                'purchase_price' => 12.00,
                'selling_price' => 24.99,
                'reorder_level' => 20,
                'unit' => 'kg',
                'is_active' => true,
            ],
        ];

        foreach ($products as $productData) {
            $product = Product::create($productData);
            
            // Update the stock that was automatically created
            $product->stock()->update([
                'quantity' => 100,
                'total_value' => $product->purchase_price * 100,
            ]);
        }
    }
}