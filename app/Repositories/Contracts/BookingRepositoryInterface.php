<?php

namespace App\Repositories\Contracts;

interface BookingRepositoryInterface
{
    public function createBooking(array $data);
    public function getUserBookings(int $userId);
    public function getActiveBookingForUser(int $userId);
    public function findBookingByQrCode(string $qrCode);
    public function findBookingById(string $bookingId);
    public function updateBookingStatus(string $bookingId, string $status);
    public function getAllBookingsPaginated(int $perPage = 15, array $filters = []);
}
