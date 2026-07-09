<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use App\Models\Vehicle;
use App\Models\ParkingArea;
use App\Models\ParkingFloor;
use App\Models\ParkingSlot;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Roles
        $adminRole = Role::create([
            'name' => 'Administrator',
            'slug' => 'admin',
            'description' => 'System administrator with full access'
        ]);

        $staffRole = Role::create([
            'name' => 'Parking Staff',
            'slug' => 'staff',
            'description' => 'Staff members managing check-ins and check-outs'
        ]);

        $customerRole = Role::create([
            'name' => 'Customer',
            'slug' => 'customer',
            'description' => 'Regular customers reserving slots and monitoring bookings'
        ]);

        // 2. Seed Permissions
        $permissions = [
            'manage-slots' => 'Create, edit, and delete parking slots',
            'manage-users' => 'Manage system users and roles',
            'scan-qr' => 'Scan booking QR codes for check-in/out',
            'create-booking' => 'Book a parking slot',
            'view-reports' => 'View occupancy and activity reports',
        ];

        $permissionModels = [];
        foreach ($permissions as $slug => $name) {
            $permissionModels[$slug] = Permission::create([
                'name' => $name,
                'slug' => $slug,
                'description' => $name
            ]);
        }

        // Assign Permissions to Roles
        // Admin gets all
        $adminRole->permissions()->sync(array_values(array_map(fn($p) => $p->id, $permissionModels)));
        // Staff gets scanning and reports
        $staffRole->permissions()->sync([
            $permissionModels['scan-qr']->id,
            $permissionModels['view-reports']->id
        ]);
        // Customer gets booking
        $customerRole->permissions()->sync([
            $permissionModels['create-booking']->id
        ]);

        // 3. Seed Users
        $adminUser = User::create([
            'name' => 'System Admin',
            'email' => 'admin@parking.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);
        $adminUser->roles()->attach($adminRole);

        $staffUser = User::create([
            'name' => 'Alex Staff',
            'email' => 'staff@parking.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);
        $staffUser->roles()->attach($staffRole);

        $customerUser = User::create([
            'name' => 'John Doe',
            'email' => 'customer@parking.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);
        $customerUser->roles()->attach($customerRole);

        // 4. Seed Customer Vehicles
        Vehicle::create([
            'plate_number' => 'B 1234 ABC',
            'vehicle_type' => 'car',
            'owner_id' => $customerUser->id,
            'status' => 'active'
        ]);

        Vehicle::create([
            'plate_number' => 'B 5678 XYZ',
            'vehicle_type' => 'motorcycle',
            'owner_id' => $customerUser->id,
            'status' => 'active'
        ]);

        // 5. Seed Parking Infrastructure
        $area = ParkingArea::create([
            'name' => 'Main Terminal',
            'code' => 'MT',
            'description' => 'Primary parking lot building',
            'status' => 'active'
        ]);

        $groundFloor = ParkingFloor::create([
            'parking_area_id' => $area->id,
            'name' => 'Ground Floor',
            'level' => 0
        ]);

        $firstFloor = ParkingFloor::create([
            'parking_area_id' => $area->id,
            'name' => 'First Floor',
            'level' => 1
        ]);

        // Ground Floor Slots (MT-G01 to MT-G10)
        $statuses = ['available', 'available', 'available', 'occupied', 'reserved', 'maintenance', 'available', 'available', 'occupied', 'available'];
        $types = ['car', 'car', 'car', 'motorcycle', 'handicap', 'car', 'motorcycle', 'car', 'car', 'car'];

        for ($i = 1; $i <= 10; $i++) {
            ParkingSlot::create([
                'parking_floor_id' => $groundFloor->id,
                'slot_number' => sprintf('MT-G%02d', $i),
                'slot_type' => $types[$i - 1],
                'status' => $statuses[$i - 1]
            ]);
        }

        // First Floor Slots (MT-F01 to MT-F10)
        for ($i = 1; $i <= 10; $i++) {
            ParkingSlot::create([
                'parking_floor_id' => $firstFloor->id,
                'slot_number' => sprintf('MT-F%02d', $i),
                'slot_type' => $i === 5 ? 'handicap' : ($i % 3 === 0 ? 'motorcycle' : 'car'),
                'status' => $i % 4 === 0 ? 'occupied' : 'available'
            ]);
        }
    }
}
