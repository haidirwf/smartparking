<?php

namespace App\Repositories\Contracts;

interface ParkingRepositoryInterface
{
    public function getAllAreasWithSlots();
    public function getAreaDetails(string $areaId);
    public function findSlotById(string $slotId);
    public function updateSlotStatus(string $slotId, string $status);
}
