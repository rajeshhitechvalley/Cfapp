<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::updateOrCreate(
            ['email' => 'admin@cafe.com'],
            [
                'name' => 'Cafe Admin',
                'email' => 'admin@cafe.com',
                'password' => Hash::make('admin123'),
                'role' => 'staff',
                'phone' => '+1234567890',
                'address' => '123 Cafe Street, Coffee City, CC 12345',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        // Create additional staff users for testing
        $staffUsers = [
            [
                'name' => 'John Manager',
                'email' => 'john@cafe.com',
                'password' => Hash::make('staff123'),
                'role' => 'staff',
                'phone' => '+1234567891',
                'address' => '124 Cafe Street, Coffee City, CC 12345',
            ],
            [
                'name' => 'Sarah Supervisor',
                'email' => 'sarah@cafe.com',
                'password' => Hash::make('staff123'),
                'role' => 'staff',
                'phone' => '+1234567892',
                'address' => '125 Cafe Street, Coffee City, CC 12345',
            ],
        ];

        foreach ($staffUsers as $staff) {
            User::updateOrCreate(
                ['email' => $staff['email']],
                array_merge($staff, [
                    'is_active' => true,
                    'email_verified_at' => now(),
                ])
            );
        }

        // Create kitchen staff users
        $kitchenUsers = [
            [
                'name' => 'Chef Mike',
                'email' => 'mike@cafe.com',
                'password' => Hash::make('kitchen123'),
                'role' => 'kitchen',
                'phone' => '+1234567893',
                'address' => '126 Cafe Street, Coffee City, CC 12345',
            ],
            [
                'name' => 'Chef Lisa',
                'email' => 'lisa@cafe.com',
                'password' => Hash::make('kitchen123'),
                'role' => 'kitchen',
                'phone' => '+1234567894',
                'address' => '127 Cafe Street, Coffee City, CC 12345',
            ],
        ];

        foreach ($kitchenUsers as $kitchen) {
            User::updateOrCreate(
                ['email' => $kitchen['email']],
                array_merge($kitchen, [
                    'is_active' => true,
                    'email_verified_at' => now(),
                ])
            );
        }

        // Create sample customer users
        $customerUsers = [
            [
                'name' => 'Alice Customer',
                'email' => 'alice@email.com',
                'password' => Hash::make('customer123'),
                'role' => 'customer',
                'phone' => '+1234567895',
                'address' => '456 Customer Lane, Shop City, SC 67890',
            ],
            [
                'name' => 'Bob Buyer',
                'email' => 'bob@email.com',
                'password' => Hash::make('customer123'),
                'role' => 'customer',
                'phone' => '+1234567896',
                'address' => '457 Customer Lane, Shop City, SC 67890',
            ],
        ];

        foreach ($customerUsers as $customer) {
            User::updateOrCreate(
                ['email' => $customer['email']],
                array_merge($customer, [
                    'is_active' => true,
                    'email_verified_at' => now(),
                ])
            );
        }

        $this->command->info('Admin and sample users created successfully!');
        $this->command->info('Admin Login: admin@cafe.com / admin123');
        $this->command->info('Staff Login: john@cafe.com / staff123');
        $this->command->info('Kitchen Login: mike@cafe.com / kitchen123');
        $this->command->info('Customer Login: alice@email.com / customer123');
    }
}
