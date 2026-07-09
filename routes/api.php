<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Guest Auth Routes
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
});

// Authenticated API Routes
Route::middleware('auth:sanctum')->group(function () {
    // User Profile
    Route::get('/user', function (Request $request) {
        return $request->user()->load('roles');
    });

    // Parking Areas & Slots Map
    Route::get('/slots', [\App\Http\Controllers\Api\ParkingController::class, 'index']);
    Route::get('/areas', [\App\Http\Controllers\Api\ParkingController::class, 'index']);
    Route::get('/areas/{id}', [\App\Http\Controllers\Api\ParkingController::class, 'show']);

    // Bookings
    Route::get('/bookings/active', [\App\Http\Controllers\Api\BookingController::class, 'active']);
    Route::get('/bookings', [\App\Http\Controllers\Api\BookingController::class, 'index']);
    Route::post('/bookings', [\App\Http\Controllers\Api\BookingController::class, 'store']);

    // Notifications
    Route::get('/notifications', function (Request $request) {
        return $request->user()->notifications()->latest()->get();
    });

    // Vehicles
    Route::get('/vehicles', [\App\Http\Controllers\Api\VehicleController::class, 'index']);
    Route::post('/vehicles', [\App\Http\Controllers\Api\VehicleController::class, 'store']);
    Route::delete('/vehicles/{id}', [\App\Http\Controllers\Api\VehicleController::class, 'destroy']);

    // Staff Scanner (Check-in / Check-out)
    Route::post('/staff/check-in', [\App\Http\Controllers\Api\StaffController::class, 'checkIn']);
    Route::post('/staff/check-out', [\App\Http\Controllers\Api\StaffController::class, 'checkOut']);

    // Admin Operations
    Route::prefix('admin')->group(function () {
        Route::get('/stats', [\App\Http\Controllers\Api\AdminController::class, 'stats']);
        Route::get('/reports', [\App\Http\Controllers\Api\AdminController::class, 'reports']);
        Route::get('/users', [\App\Http\Controllers\Api\AdminController::class, 'users']);
        Route::post('/users/{id}/role', [\App\Http\Controllers\Api\AdminController::class, 'updateRole']);
        Route::put('/slots/{id}', [\App\Http\Controllers\Api\AdminController::class, 'updateSlot']);
    });
});
