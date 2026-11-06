<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class SalonTeamMember extends Model
{
    public const ROLE_MANAGER = 'manager';
    public const ROLE_STYLIST = 'stylist';
    public const ROLE_RECEPTIONIST = 'receptionist';

    protected $fillable = [
        'salon_profile_id',
        'user_id',
        'role',
        'status',
        'invited_by_user_id',
        'accepted_at',
    ];

    protected function casts(): array
    {
        return [
            'accepted_at' => 'datetime',
        ];
    }

    public function salon(): BelongsTo
    {
        return $this->belongsTo(ProfessionalProfile::class, 'salon_profile_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function invitedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by_user_id');
    }

    public function services(): BelongsToMany
    {
        return $this->belongsToMany(
            Service::class,
            'service_team_member',
            'salon_team_member_id',
            'service_id',
        )->withTimestamps();
    }
}
