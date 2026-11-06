<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\ProfessionalProfile;
use App\Models\SalonTeamMember;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ServiceController extends Controller
{
    public function index(ProfessionalProfile $professional): JsonResponse
    {
        $services = Service::query()
            ->with('teamMembers:id')
            ->where('professional_profile_id', $professional->id)
            ->whereHas('professionalProfile', fn ($query) => $query->where('verification_status', 'verified'))
            ->where('is_active', true)
            ->orderBy('category')
            ->orderBy('name')
            ->paginate(50);

        return response()->json([
            'data' => $services->getCollection()->map(fn (Service $service): array => $this->payload($service)),
            'meta' => [
                'current_page' => $services->currentPage(),
                'last_page' => $services->lastPage(),
                'per_page' => $services->perPage(),
                'total' => $services->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $profile = $this->ownedProfile($request);
        $data = $this->validatedData($request, false);
        $teamMemberIds = $data['team_member_ids'] ?? [];
        unset($data['team_member_ids']);
        $isActive = (bool) ($data['is_active'] ?? false);
        unset($data['is_active']);

        if ($isActive && $profile->verification_status !== 'verified') {
            throw ValidationException::withMessages([
                'is_active' => ['Professional identity verification must be complete before a service can be published.'],
            ]);
        }

        $this->assertTeamAssignments($profile, $teamMemberIds);

        $service = Service::query()->create([
            ...$data,
            'professional_profile_id' => $profile->id,
            'slug' => Str::slug($data['name']).'-'.Str::lower(Str::random(6)),
            'currency' => 'KES',
            'is_active' => $isActive,
        ]);

        if ($teamMemberIds !== []) {
            $service->teamMembers()->sync($teamMemberIds);
        }

        $this->audit($request, 'service.created', $service, ['professional_profile_id' => $profile->id]);

        return response()->json(['data' => $this->payload($service->fresh()->load('teamMembers:id'))], 201);
    }

    public function update(Request $request, Service $service): JsonResponse
    {
        $profile = $this->ownedProfile($request);
        abort_unless((int) $service->professional_profile_id === (int) $profile->id, 404);

        $data = $this->validatedData($request, true);
        $teamMemberIds = $data['team_member_ids'] ?? null;
        unset($data['team_member_ids']);

        if ($teamMemberIds !== null) {
            $this->assertTeamAssignments($profile, $teamMemberIds);
        }

        if (($data['is_active'] ?? false) && $profile->verification_status !== 'verified') {
            throw ValidationException::withMessages([
                'is_active' => ['Professional identity verification must be complete before a service can be published.'],
            ]);
        }

        $service->fill($data)->save();

        if ($teamMemberIds !== null) {
            $service->teamMembers()->sync($teamMemberIds);
        }

        $this->audit($request, 'service.updated', $service, ['fields' => array_keys($data)]);

        return response()->json(['data' => $this->payload($service->fresh()->load('teamMembers:id'))]);
    }

    public function archive(Request $request, Service $service): JsonResponse
    {
        $profile = $this->ownedProfile($request);
        abort_unless((int) $service->professional_profile_id === (int) $profile->id, 404);

        $service->update(['is_active' => false]);

        $this->audit($request, 'service.archived', $service, []);

        return response()->json(['message' => 'Service removed from the public catalogue.']);
    }

    private function ownedProfile(Request $request): ProfessionalProfile
    {
        $profile = $request->user()->professionalProfile;

        abort_unless($profile, 403, 'A professional profile is required.');

        return $profile;
    }

    private function validatedData(Request $request, bool $partial): array
    {
        if ($partial && $request->all() === []) {
            throw ValidationException::withMessages([
                'service' => ['Provide at least one field to update.'],
            ]);
        }

        $required = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'name' => [$required, 'string', 'max:160'],
            'category' => [$required, 'string', 'max:80'],
            'description' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'price_minor' => [$required, 'integer', 'min:0', 'max:9999999999999'],
            'duration_minutes' => [$required, 'integer', 'min:15', 'max:1440'],
            'buffer_before_minutes' => ['sometimes', 'integer', 'min:0', 'max:180'],
            'buffer_after_minutes' => ['sometimes', 'integer', 'min:0', 'max:180'],
            'is_active' => ['sometimes', 'boolean'],
            'requires_consultation' => ['sometimes', 'boolean'],
            'team_member_ids' => ['sometimes', 'array', 'max:100'],
            'team_member_ids.*' => ['integer', 'distinct'],
        ]);
    }

    private function assertTeamAssignments(ProfessionalProfile $profile, array $teamMemberIds): void
    {
        if ($teamMemberIds === []) {
            return;
        }

        if ($profile->type !== 'salon') {
            throw ValidationException::withMessages([
                'team_member_ids' => ['Only salon services can be assigned to salon team members.'],
            ]);
        }

        $count = SalonTeamMember::query()
            ->where('salon_profile_id', $profile->id)
            ->where('status', 'active')
            ->whereHas('user.professionalProfile', fn ($query) => $query->where('verification_status', 'verified'))
            ->whereIn('id', $teamMemberIds)
            ->count();

        if ($count !== count(array_unique($teamMemberIds))) {
            throw ValidationException::withMessages([
                'team_member_ids' => ['Every assigned team member must belong to this salon and be active.'],
            ]);
        }
    }

    private function payload(Service $service): array
    {
        return [
            'id' => (string) $service->id,
            'professional_profile_id' => (string) $service->professional_profile_id,
            'name' => $service->name,
            'slug' => $service->slug,
            'category' => $service->category,
            'description' => $service->description,
            'price_minor' => $service->price_minor,
            'currency' => $service->currency,
            'duration_minutes' => $service->duration_minutes,
            'buffer_before_minutes' => $service->buffer_before_minutes,
            'buffer_after_minutes' => $service->buffer_after_minutes,
            'is_active' => $service->is_active,
            'requires_consultation' => $service->requires_consultation,
            'team_member_ids' => $service->teamMembers->pluck('id')->map(fn ($id): string => (string) $id)->values()->all(),
            'created_at' => $service->created_at?->toISOString(),
            'updated_at' => $service->updated_at?->toISOString(),
        ];
    }

    private function audit(Request $request, string $event, Service $service, array $metadata): void
    {
        AuditLog::query()->create([
            'actor_user_id' => $request->user()->id,
            'event' => $event,
            'subject_type' => Service::class,
            'subject_id' => (string) $service->id,
            'request_id' => $request->attributes->get('request_id'),
            'metadata' => $metadata,
            'created_at' => now(),
        ]);
    }
}
