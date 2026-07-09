<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\BookingService;
use App\Repositories\Contracts\BookingRepositoryInterface;
use Illuminate\Http\Request;
use Exception;

class BookingController extends Controller
{
    protected $bookingService;
    protected $bookingRepository;

    public function __construct(
        BookingService $bookingService,
        BookingRepositoryInterface $bookingRepository
    ) {
        $this->bookingService = $bookingService;
        $this->bookingRepository = $bookingRepository;
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'parking_slot_id' => ['required', 'string', 'exists:parking_slots,id'],
            'vehicle_id' => ['required', 'string', 'exists:vehicles,id'],
            'arrival_time' => ['required', 'date_format:Y-m-d H:i:s'],
        ]);

        $data['user_id'] = $request->user()->id;

        try {
            $booking = $this->bookingService->reserveSlot($data);
            return response()->json([
                'message' => 'Slot reserved successfully',
                'booking' => $booking
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 422);
        }
    }

    public function index(Request $request)
    {
        $bookings = $this->bookingRepository->getUserBookings($request->user()->id);
        return response()->json($bookings);
    }

    public function active(Request $request)
    {
        $booking = $this->bookingRepository->getActiveBookingForUser($request->user()->id);
        if (!$booking) {
            return response()->json(null);
        }
        return response()->json($booking);
    }
}
