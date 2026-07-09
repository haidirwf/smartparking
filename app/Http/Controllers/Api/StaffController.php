<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\BookingService;
use Illuminate\Http\Request;
use Exception;

class StaffController extends Controller
{
    protected $bookingService;

    public function __construct(BookingService $bookingService)
    {
        $this->bookingService = $bookingService;
    }

    public function checkIn(Request $request)
    {
        $data = $request->validate([
            'qr_code' => ['required', 'string'],
        ]);

        try {
            $session = $this->bookingService->checkIn($data['qr_code']);
            return response()->json([
                'message' => 'Check-in successful. Parking session started.',
                'session' => $session
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 422);
        }
    }

    public function checkOut(Request $request)
    {
        $data = $request->validate([
            'qr_code' => ['required', 'string'],
        ]);

        try {
            $session = $this->bookingService->checkOut($data['qr_code']);
            return response()->json([
                'message' => 'Check-out successful. Parking session completed.',
                'session' => $session
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 422);
        }
    }
}
