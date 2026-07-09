<?php

namespace App\Repositories\Eloquent;

use App\Models\Booking;
use App\Repositories\Contracts\BookingRepositoryInterface;

class BookingRepository implements BookingRepositoryInterface
{
    public function createBooking(array $data)
    {
        return Booking::create($data);
    }

    public function getUserBookings(int $userId)
    {
        return Booking::with(['slot.floor.area', 'vehicle'])
            ->where('user_id', $userId)
            ->latest()
            ->get();
    }

    public function getActiveBookingForUser(int $userId)
    {
        return Booking::with(['slot.floor.area', 'vehicle', 'session'])
            ->where('user_id', $userId)
            ->whereIn('status', ['pending', 'active'])
            ->first();
    }

    public function findBookingByQrCode(string $qrCode)
    {
        return Booking::with(['slot.floor.area', 'vehicle', 'user'])
            ->where('qr_code', $qrCode)
            ->first();
    }

    public function findBookingById(string $bookingId)
    {
        return Booking::with(['slot.floor.area', 'vehicle', 'user', 'session'])->findOrFail($bookingId);
    }

    public function updateBookingStatus(string $bookingId, string $status)
    {
        $booking = Booking::findOrFail($bookingId);
        $booking->update(['status' => $status]);
        return $booking;
    }

    public function getAllBookingsPaginated(int $perPage = 15, array $filters = [])
    {
        $query = Booking::with(['user', 'slot.floor.area', 'vehicle', 'session'])->latest();

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('qr_code', 'like', "%{$search}%")
                  ->orWhereHas('user', function($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  })
                  ->orWhereHas('vehicle', function($vq) use ($search) {
                      $vq->where('plate_number', 'like', "%{$search}%");
                  });
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->paginate($perPage);
    }
}
