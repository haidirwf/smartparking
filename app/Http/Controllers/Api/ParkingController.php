<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Repositories\Contracts\ParkingRepositoryInterface;

class ParkingController extends Controller
{
    protected $parkingRepository;

    public function __construct(ParkingRepositoryInterface $parkingRepository)
    {
        $this->parkingRepository = $parkingRepository;
    }

    public function index()
    {
        $areas = $this->parkingRepository->getAllAreasWithSlots();
        return response()->json($areas);
    }

    public function show(string $id)
    {
        $area = $this->parkingRepository->getAreaDetails($id);
        return response()->json($area);
    }
}
