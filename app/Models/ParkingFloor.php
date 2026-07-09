<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ParkingFloor extends Model
{
    use HasUuids;

    protected $fillable = ['parking_area_id', 'name', 'level'];

    public function area(): BelongsTo
    {
        return $this->belongsTo(ParkingArea::class, 'parking_area_id');
    }

    public function slots(): HasMany
    {
        return $this->hasMany(ParkingSlot::class);
    }
}
