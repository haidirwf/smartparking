<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Models\ParkingSlot;
use App\Models\Booking;
use App\Models\ParkingSession;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function stats()
    {
        $totalSlots = ParkingSlot::count();
        $occupiedSlots = ParkingSlot::where('status', 'occupied')->count();
        $reservedSlots = ParkingSlot::where('status', 'reserved')->count();
        $availableSlots = ParkingSlot::where('status', 'available')->count();
        
        $reservationsToday = Booking::whereDate('created_at', now()->toDateString())->count();
        $activeSessions = ParkingSession::where('status', 'active')->count();
        $registeredVehicles = Vehicle::count();
        $registeredUsers = User::count();

        $occupancyRate = $totalSlots > 0 ? round(($occupiedSlots / $totalSlots) * 100, 1) : 0;

        // Mock peak hour calculations
        $peakHour = '14:00 - 15:00';

        return response()->json([
            'total_slots' => $totalSlots,
            'available_slots' => $availableSlots,
            'occupied_slots' => $occupiedSlots,
            'reserved_slots' => $reservedSlots,
            'reservations_today' => $reservationsToday,
            'active_sessions' => $activeSessions,
            'registered_vehicles' => $registeredVehicles,
            'registered_users' => $registeredUsers,
            'occupancy_rate' => $occupancyRate,
            'peak_hour' => $peakHour
        ]);
    }

    public function reports()
    {
        // Daily trends (last 7 days occupancy mockup data structured for charts)
        $dailyOccupancy = [
            ['day' => 'Mon', 'rate' => 65],
            ['day' => 'Tue', 'rate' => 72],
            ['day' => 'Wed', 'rate' => 80],
            ['day' => 'Thu', 'rate' => 78],
            ['day' => 'Fri', 'rate' => 85],
            ['day' => 'Sat', 'rate' => 50],
            ['day' => 'Sun', 'rate' => 42],
        ];

        $hourlyPeak = [
            ['time' => '08:00', 'bookings' => 12],
            ['time' => '10:00', 'bookings' => 24],
            ['time' => '12:00', 'bookings' => 38],
            ['time' => '14:00', 'bookings' => 45],
            ['time' => '16:00', 'bookings' => 30],
            ['time' => '18:00', 'bookings' => 18],
        ];

        return response()->json([
            'daily_occupancy' => $dailyOccupancy,
            'hourly_peak' => $hourlyPeak,
        ]);
    }

    public function users()
    {
        $users = User::with('roles')->latest()->get();
        return response()->json($users);
    }

    public function updateRole(Request $request, string $userId)
    {
        $data = $request->validate([
            'role_slug' => ['required', 'string', 'exists:roles,slug']
        ]);

        $user = User::findOrFail($userId);
        $role = Role::where('slug', $data['role_slug'])->firstOrFail();

        $user->roles()->sync([$role->id]);

        return response()->json([
            'message' => 'User role updated successfully',
            'user' => $user->load('roles')
        ]);
    }

    public function updateSlot(Request $request, string $slotId)
    {
        $data = $request->validate([
            'status' => ['required', 'string', 'in:available,maintenance,reserved,occupied'],
            'slot_type' => ['sometimes', 'string', 'in:car,motorcycle,handicap']
        ]);

        $slot = ParkingSlot::findOrFail($slotId);
        $slot->update($data);

        return response()->json([
            'message' => 'Parking slot updated successfully',
            'slot' => $slot
        ]);
    }
}
