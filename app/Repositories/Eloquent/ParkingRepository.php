<?php

namespace App\Repositories\Eloquent;

use App\Models\ParkingArea;
use App\Models\ParkingSlot;
use App\Repositories\Contracts\ParkingRepositoryInterface;

class ParkingRepository implements ParkingRepositoryInterface
{
    public function getAllAreasWithSlots()
    {
        return ParkingArea::with(['floors.slots'])->where('status', 'active')->get();
    }

    public function getAreaDetails(string $areaId)
    {
        return ParkingArea::with(['floors.slots'])->findOrFail($areaId);
    }

    public function findSlotById(string $slotId)
    {
        return ParkingSlot::with('floor.area')->findOrFail($slotId);
    }

    public function updateSlotStatus(string $slotId, string $status)
    {
        $slot = ParkingSlot::findOrFail($slotId);
        $slot->update(['status' => $status]);
        return $slot;
    }
}
