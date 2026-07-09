<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class ParkingArea extends Model
{
    use HasUuids;

    protected $fillable = ['name', 'code', 'description', 'status'];

    public function floors(): HasMany
    {
        return $this->hasMany(ParkingFloor::class);
    }

    public function slots(): HasManyThrough
    {
        return $this->hasManyThrough(ParkingSlot::class, ParkingFloor::class);
    }
}
