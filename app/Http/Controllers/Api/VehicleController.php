<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function index(Request $request)
    {
        $vehicles = $request->user()->vehicles()->latest()->get();
        return response()->json($vehicles);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'plate_number' => ['required', 'string', 'max:20', 'unique:vehicles,plate_number'],
            'vehicle_type' => ['required', 'string', 'in:car,motorcycle,handicap'],
        ]);

        $vehicle = $request->user()->vehicles()->create([
            'plate_number' => strtoupper($data['plate_number']),
            'vehicle_type' => $data['vehicle_type'],
            'status' => 'active'
        ]);

        return response()->json([
            'message' => 'Vehicle registered successfully',
            'vehicle' => $vehicle
        ], 201);
    }

    public function destroy(Request $request, string $id)
    {
        $vehicle = $request->user()->vehicles()->findOrFail($id);
        $vehicle->delete();

        return response()->json([
            'message' => 'Vehicle removed successfully'
        ]);
    }
}
