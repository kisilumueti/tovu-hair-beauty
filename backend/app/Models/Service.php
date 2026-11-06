<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Service extends Model
{
    protected $fillable = [
        'professional_profile_id',
        'name',
        'slug',
        'category',
        'description',
        'price_minor',
        'currency',
        'duration_minutes',
        'buffer_before_minutes',
        'buffer_after_minutes',
        'is_active',
        'requires_consultation',
    ];

    protected function casts(): array
    {
        return [
            'price_minor' => 'integer',
            'duration_minutes' => 'integer',
            'buffer_before_minutes' => 'integer',
            'buffer_after_minutes' => 'integer',
            'is_active' => 'boolean',
            'requires_consultation' => 'boolean',
        ];
    }

    public function professionalProfile(): BelongsTo
    {
        return $this->belongsTo(ProfessionalProfile::class);
    }

    public function teamMembers(): BelongsToMany
    {
        return $this->belongsToMany(
            SalonTeamMember::class,
            'service_team_member',
            'service_id',
            'salon_team_member_id',
        )->withTimestamps();
    }
}
