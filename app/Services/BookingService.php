<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\ParkingSession;
use App\Models\Notification;
use App\Models\ActivityLog;
use App\Repositories\Contracts\BookingRepositoryInterface;
use App\Repositories\Contracts\ParkingRepositoryInterface;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Exception;

class BookingService
{
    protected $bookingRepository;
    protected $parkingRepository;

    public function __construct(
        BookingRepositoryInterface $bookingRepository,
        ParkingRepositoryInterface $parkingRepository
    ) {
        $this->bookingRepository = $bookingRepository;
        $this->parkingRepository = $parkingRepository;
    }

    public function reserveSlot(array $data)
    {
        return DB::transaction(function () use ($data) {
            $userId = $data['user_id'];
            $slotId = $data['parking_slot_id'];
            $vehicleId = $data['vehicle_id'];

            // 1. Check if user already has an active booking or active session
            $activeBooking = $this->bookingRepository->getActiveBookingForUser($userId);
            if ($activeBooking) {
                throw new Exception('You already have an active booking or session.');
            }

            // 2. Check if slot is available
            $slot = $this->parkingRepository->findSlotById($slotId);
            if ($slot->status !== 'available') {
                throw new Exception('Selected slot is no longer available.');
            }

            // 3. Create Booking
            $arrivalTime = now()->parse($data['arrival_time']);
            $expiresAt = $arrivalTime->copy()->addMinutes(30); // 30 minutes reservation timeout

            $booking = $this->bookingRepository->createBooking([
                'user_id' => $userId,
                'parking_slot_id' => $slotId,
                'vehicle_id' => $vehicleId,
                'arrival_time' => $arrivalTime,
                'expires_at' => $expiresAt,
                'qr_code' => 'QR-' . strtoupper(Str::random(12)),
                'status' => 'pending'
            ]);

            // 4. Update Slot status to reserved
            $this->parkingRepository->updateSlotStatus($slotId, 'reserved');

            // 5. Create Notification
            Notification::create([
                'user_id' => $userId,
                'title' => 'Booking Confirmed',
                'message' => "Your booking for slot {$slot->slot_number} on {$slot->floor->name} has been confirmed. QR code generated.",
                'type' => 'booking_confirmed'
            ]);

            // 6. Log Activity
            ActivityLog::create([
                'user_id' => $userId,
                'action' => 'CREATE_BOOKING',
                'description' => "Reserved slot {$slot->slot_number} (Booking ID: {$booking->id})"
            ]);

            return $booking->load(['slot.floor.area', 'vehicle']);
        });
    }

    public function checkIn(string $qrCode)
    {
        return DB::transaction(function () use ($qrCode) {
            $booking = $this->bookingRepository->findBookingByQrCode($qrCode);
            if (!$booking) {
                throw new Exception('Invalid QR code.');
            }

            if ($booking->status !== 'pending') {
                throw new Exception("This booking is already {$booking->status}.");
            }

            if (now()->greaterThan($booking->expires_at)) {
                // Booking has expired
                $booking->update(['status' => 'expired']);
                $this->parkingRepository->updateSlotStatus($booking->parking_slot_id, 'available');
                throw new Exception('This booking has expired.');
            }

            // Begin Parking Session
            $session = ParkingSession::create([
                'booking_id' => $booking->id,
                'parking_slot_id' => $booking->parking_slot_id,
                'vehicle_id' => $booking->vehicle_id,
                'entry_time' => now(),
                'status' => 'active'
            ]);

            // Update Booking Status to Active
            $booking->update(['status' => 'active']);

            // Update Slot status to Occupied
            $this->parkingRepository->updateSlotStatus($booking->parking_slot_id, 'occupied');

            // Create notification
            Notification::create([
                'user_id' => $booking->user_id,
                'title' => 'Vehicle Checked In',
                'message' => "Your vehicle {$booking->vehicle->plate_number} has checked into slot {$booking->slot->slot_number}.",
                'type' => 'vehicle_checked_in'
            ]);

            // Log activity
            ActivityLog::create([
                'user_id' => $booking->user_id,
                'action' => 'VEHICLE_CHECKIN',
                'description' => "Vehicle check-in for slot {$booking->slot->slot_number} via QR"
            ]);

            return $session->load(['booking', 'slot.floor.area', 'vehicle']);
        });
    }

    public function checkOut(string $qrCode)
    {
        return DB::transaction(function () use ($qrCode) {
            $booking = $this->bookingRepository->findBookingByQrCode($qrCode);
            if (!$booking) {
                throw new Exception('Invalid QR code.');
            }

            if ($booking->status !== 'active') {
                throw new Exception('No active parking session found for this booking.');
            }

            $session = ParkingSession::where('booking_id', $booking->id)
                ->where('status', 'active')
                ->first();

            if (!$session) {
                throw new Exception('No active session associated with this booking.');
            }

            $exitTime = now();
            $durationMinutes = max(1, intval($session->entry_time->diffInMinutes($exitTime)));

            // Update Session
            $session->update([
                'exit_time' => $exitTime,
                'duration_minutes' => $durationMinutes,
                'status' => 'completed'
            ]);

            // Update Booking
            $booking->update(['status' => 'completed']);

            // Update Slot to Available
            $this->parkingRepository->updateSlotStatus($booking->parking_slot_id, 'available');

            // Create Notification
            Notification::create([
                'user_id' => $booking->user_id,
                'title' => 'Vehicle Checked Out',
                'message' => "Your vehicle {$booking->vehicle->plate_number} has checked out. Duration: {$durationMinutes} mins.",
                'type' => 'vehicle_checked_out'
            ]);

            // Log activity
            ActivityLog::create([
                'user_id' => $booking->user_id,
                'action' => 'VEHICLE_CHECKOUT',
                'description' => "Vehicle checked out from slot {$booking->slot->slot_number}. Duration: {$durationMinutes} minutes."
            ]);

            return $session->load(['booking', 'slot.floor.area', 'vehicle']);
        });
    }

    public function forceCheckout(string $bookingId)
    {
        return DB::transaction(function () use ($bookingId) {
            $booking = $this->bookingRepository->findBookingById($bookingId);
            
            if ($booking->status !== 'active') {
                throw new Exception('This booking is not active.');
            }

            $session = ParkingSession::where('booking_id', $booking->id)
                ->where('status', 'active')
                ->first();

            $exitTime = now();
            $durationMinutes = $session ? max(1, intval($session->entry_time->diffInMinutes($exitTime))) : 0;

            if ($session) {
                $session->update([
                    'exit_time' => $exitTime,
                    'duration_minutes' => $durationMinutes,
                    'status' => 'completed'
                ]);
            }

            $booking->update(['status' => 'completed']);
            $this->parkingRepository->updateSlotStatus($booking->parking_slot_id, 'available');

            Notification::create([
                'user_id' => $booking->user_id,
                'title' => 'Force Checkout Complete',
                'message' => "Your session in slot {$booking->slot->slot_number} was ended by the administrator.",
                'type' => 'vehicle_checked_out'
            ]);

            return $booking;
        });
    }
}
