<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Booking extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'parking_slot_id',
        'vehicle_id',
        'arrival_time',
        'expires_at',
        'qr_code',
        'status', // pending, active, completed, cancelled, expired
    ];

    protected $casts = [
        'arrival_time' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function slot(): BelongsTo
    {
        return $this->belongsTo(ParkingSlot::class, 'parking_slot_id');
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function session(): HasOne
    {
        return $this->hasOne(ParkingSession::class);
    }
}
