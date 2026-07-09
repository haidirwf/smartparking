<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ParkingSlot extends Model
{
    use HasUuids;

    protected $fillable = ['parking_floor_id', 'slot_number', 'slot_type', 'status'];

    public function floor(): BelongsTo
    {
        return $this->belongsTo(ParkingFloor::class, 'parking_floor_id');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(ParkingSession::class);
    }
}
