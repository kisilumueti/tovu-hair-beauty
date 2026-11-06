<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProfessionalProfile extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'business_name',
        'slug',
        'location',
        'bio',
        'verification_status',
        'verified_at',
    ];

    protected function casts(): array
    {
        return [
            'verified_at' => 'datetime',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    public function teamMembers(): HasMany
    {
        return $this->hasMany(SalonTeamMember::class, 'salon_profile_id');
    }

    public function teamInvitations(): HasMany
    {
        return $this->hasMany(SalonTeamInvitation::class, 'salon_profile_id');
    }
}
