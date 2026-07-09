<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Roles
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->string('description')->nullable();
            $table->timestamps();
        });

        // 2. Permissions
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->string('description')->nullable();
            $table->timestamps();
        });

        // 3. Role-User Pivot
        Schema::create('role_user', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('role_id')->constrained()->onDelete('cascade');
            $table->primary(['user_id', 'role_id']);
        });

        // 4. Permission-Role Pivot
        Schema::create('permission_role', function (Blueprint $table) {
            $table->foreignId('permission_id')->constrained()->onDelete('cascade');
            $table->foreignId('role_id')->constrained()->onDelete('cascade');
            $table->primary(['permission_id', 'role_id']);
        });

        // 5. Vehicles
        Schema::create('vehicles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('plate_number')->unique();
            $table->string('vehicle_type'); // e.g. car, motorcycle, handicap
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
            $table->string('status')->default('active'); // active, inactive
            $table->timestamps();
        });

        // 6. Parking Areas
        Schema::create('parking_areas', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->string('status')->default('active'); // active, maintenance
            $table->timestamps();
        });

        // 7. Parking Floors
        Schema::create('parking_floors', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('parking_area_id')->constrained('parking_areas')->onDelete('cascade');
            $table->string('name');
            $table->integer('level'); // e.g. -1, 0, 1, 2
            $table->timestamps();
        });

        // 8. Parking Slots
        Schema::create('parking_slots', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('parking_floor_id')->constrained('parking_floors')->onDelete('cascade');
            $table->string('slot_number'); // e.g. A-101
            $table->string('slot_type')->default('car'); // car, motorcycle, handicap
            $table->string('status')->default('available'); // available, reserved, occupied, maintenance
            $table->timestamps();
            $table->unique(['parking_floor_id', 'slot_number']);
        });

        // 9. Bookings
        Schema::create('bookings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('parking_slot_id')->constrained('parking_slots')->onDelete('cascade');
            $table->foreignUuid('vehicle_id')->constrained('vehicles')->onDelete('cascade');
            $table->dateTime('arrival_time');
            $table->dateTime('expires_at');
            $table->string('qr_code')->unique();
            $table->string('status')->default('pending'); // pending, active, completed, cancelled, expired
            $table->timestamps();
        });

        // 10. Parking Sessions
        Schema::create('parking_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('booking_id')->nullable()->constrained('bookings')->onDelete('set null');
            $table->foreignUuid('parking_slot_id')->constrained('parking_slots')->onDelete('cascade');
            $table->foreignUuid('vehicle_id')->constrained('vehicles')->onDelete('cascade');
            $table->dateTime('entry_time');
            $table->dateTime('exit_time')->nullable();
            $table->integer('duration_minutes')->nullable();
            $table->string('status')->default('active'); // active, completed
            $table->timestamps();
        });

        // 11. Notifications
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('message');
            $table->string('type'); // e.g., booking_confirmed, booking_reminder, booking_expired, vehicle_checked_in, vehicle_checked_out, warning
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });

        // 12. Activity Logs
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('action');
            $table->text('description');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('parking_sessions');
        Schema::dropIfExists('bookings');
        Schema::dropIfExists('parking_slots');
        Schema::dropIfExists('parking_floors');
        Schema::dropIfExists('parking_areas');
        Schema::dropIfExists('vehicles');
        Schema::dropIfExists('permission_role');
        Schema::dropIfExists('role_user');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');
    }
};
