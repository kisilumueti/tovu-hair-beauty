<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\ProfessionalProfile;
use App\Models\SalonTeamInvitation;
use App\Models\SalonTeamMember;
use App\Notifications\SalonTeamInvitationNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Throwable;

class SalonTeamController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $salon = $this->ownedSalon($request);

        $members = SalonTeamMember::query()
            ->with(['user:id,name,email'])
            ->where('salon_profile_id', $salon->id)
            ->orderBy('role')
            ->orderBy('id')
            ->get()
            ->map(fn (SalonTeamMember $member): array => [
                'id' => (string) $member->id,
                'user' => [
                    'id' => (string) $member->user->id,
                    'name' => $member->user->name,
                    'email' => $member->user->email,
                ],
                'role' => $member->role,
                'status' => $member->status,
                'accepted_at' => $member->accepted_at?->toISOString(),
            ]);

        return response()->json(['data' => $members]);
    }

    public function invite(Request $request): JsonResponse
    {
        $salon = $this->ownedSalon($request);

        $data = $request->validate([
            'email' => ['required', 'email:rfc', 'max:255'],
            'role' => ['required', Rule::in([
                SalonTeamMember::ROLE_MANAGER,
                SalonTeamMember::ROLE_STYLIST,
                SalonTeamMember::ROLE_RECEPTIONIST,
            ])],
        ]);

        $email = mb_strtolower(trim($data['email']));
        $existingMember = SalonTeamMember::query()
            ->where('salon_profile_id', $salon->id)
            ->whereHas('user', fn ($query) => $query->where('email', $email))
            ->where('status', 'active')
            ->exists();

        if ($existingMember) {
            return response()->json(['message' => 'This person is already an active member of the salon team.'], 409);
        }

        $plainToken = Str::random(64);
        $expiresAt = now()->addDays(3);
        $invitationUrl = rtrim((string) config('services.frontend.url'), '/')
            .'/team/invitations/accept?token='.urlencode($plainToken);

        try {
            $invitation = DB::transaction(function () use ($request, $salon, $email, $data, $plainToken, $expiresAt, $invitationUrl): SalonTeamInvitation {
                SalonTeamInvitation::query()
                    ->where('salon_profile_id', $salon->id)
                    ->where('email', $email)
                    ->whereNull('accepted_at')
                    ->whereNull('revoked_at')
                    ->where('expires_at', '>', now())
                    ->lockForUpdate()
                    ->get()
                    ->each(fn (SalonTeamInvitation $pending) => $pending->update(['revoked_at' => now()]));

                $invitation = SalonTeamInvitation::query()->create([
                    'salon_profile_id' => $salon->id,
                    'email' => $email,
                    'role' => $data['role'],
                    'token_hash' => hash('sha256', $plainToken),
                    'invited_by_user_id' => $request->user()->id,
                    'expires_at' => $expiresAt,
                ]);

                Notification::route('mail', $email)->notify(new SalonTeamInvitationNotification(
                    salonName: $salon->business_name,
                    invitationUrl: $invitationUrl,
                    role: $data['role'],
                    expiresAt: $expiresAt->toDayDateTimeString(),
                ));

                AuditLog::query()->create([
                    'actor_user_id' => $request->user()->id,
                    'event' => 'salon.team_invitation.sent',
                    'subject_type' => SalonTeamInvitation::class,
                    'subject_id' => (string) $invitation->id,
                    'request_id' => $request->attributes->get('request_id'),
                    'metadata' => ['role' => $data['role']],
                    'created_at' => now(),
                ]);

                return $invitation;
            });
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'The invitation could not be delivered. Check the configured mail transport and try again.',
                'request_id' => $request->attributes->get('request_id'),
            ], 503);
        }

        return response()->json([
            'data' => [
                'invitation_id' => (string) $invitation->id,
                'email' => $invitation->email,
                'role' => $invitation->role,
                'expires_at' => $invitation->expires_at->toISOString(),
                'status' => 'sent',
            ],
        ], 202);
    }

    public function acceptInvitation(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token' => ['required', 'string', 'min:32', 'max:128'],
        ]);

        $user = $request->user();

        if ($user->role !== 'stylist' || !$user->professionalProfile) {
            return response()->json(['message' => 'A registered independent stylist account is required to join a salon team.'], 403);
        }

        $member = DB::transaction(function () use ($request, $user, $data): ?SalonTeamMember {
            $invitation = SalonTeamInvitation::query()
                ->where('token_hash', hash('sha256', $data['token']))
                ->lockForUpdate()
                ->first();

            if (
                !$invitation
                || $invitation->accepted_at
                || $invitation->revoked_at
                || $invitation->expires_at->isPast()
                || !hash_equals(mb_strtolower($invitation->email), mb_strtolower($user->email))
            ) {
                return null;
            }

            $salon = $invitation->salon()->first();

            if (!$salon || $salon->type !== 'salon') {
                return null;
            }

            $member = SalonTeamMember::query()->firstOrCreate(
                [
                    'salon_profile_id' => $salon->id,
                    'user_id' => $user->id,
                ],
                [
                    'role' => $invitation->role,
                    'status' => 'active',
                    'invited_by_user_id' => $invitation->invited_by_user_id,
                    'accepted_at' => now(),
                ],
            );

            if ($member->status !== 'active') {
                $member->update([
                    'role' => $invitation->role,
                    'status' => 'active',
                    'accepted_at' => now(),
                ]);
            }

            $invitation->update(['accepted_at' => now()]);

            AuditLog::query()->create([
                'actor_user_id' => $user->id,
                'event' => 'salon.team_invitation.accepted',
                'subject_type' => SalonTeamMember::class,
                'subject_id' => (string) $member->id,
                'request_id' => $request->attributes->get('request_id'),
                'metadata' => ['salon_profile_id' => $salon->id, 'role' => $member->role],
                'created_at' => now(),
            ]);

            return $member;
        });

        if (!$member) {
            return response()->json(['message' => 'This invitation is invalid, expired, revoked, or does not belong to your account.'], 422);
        }

        return response()->json([
            'data' => [
                'id' => (string) $member->id,
                'salon_profile_id' => (string) $member->salon_profile_id,
                'role' => $member->role,
                'status' => $member->status,
            ],
        ], 201);
    }

    public function updateRole(Request $request, SalonTeamMember $member): JsonResponse
    {
        $salon = $this->ownedSalon($request);
        $this->ensureMemberBelongsToSalon($member, $salon);

        $data = $request->validate([
            'role' => ['required', Rule::in([
                SalonTeamMember::ROLE_MANAGER,
                SalonTeamMember::ROLE_STYLIST,
                SalonTeamMember::ROLE_RECEPTIONIST,
            ])],
        ]);

        $member->update(['role' => $data['role']]);

        AuditLog::query()->create([
            'actor_user_id' => $request->user()->id,
            'event' => 'salon.team_member.role_updated',
            'subject_type' => SalonTeamMember::class,
            'subject_id' => (string) $member->id,
            'request_id' => $request->attributes->get('request_id'),
            'metadata' => ['role' => $member->role],
            'created_at' => now(),
        ]);

        return response()->json(['data' => ['id' => (string) $member->id, 'role' => $member->role]]);
    }

    public function suspend(Request $request, SalonTeamMember $member): JsonResponse
    {
        $salon = $this->ownedSalon($request);
        $this->ensureMemberBelongsToSalon($member, $salon);

        $member->update(['status' => 'suspended']);

        AuditLog::query()->create([
            'actor_user_id' => $request->user()->id,
            'event' => 'salon.team_member.suspended',
            'subject_type' => SalonTeamMember::class,
            'subject_id' => (string) $member->id,
            'request_id' => $request->attributes->get('request_id'),
            'metadata' => [],
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'Team member access suspended.']);
    }

    private function ownedSalon(Request $request): ProfessionalProfile
    {
        $profile = $request->user()->professionalProfile;

        abort_unless($profile && $profile->type === 'salon', 403, 'A salon owner account is required.');

        return $profile;
    }

    private function ensureMemberBelongsToSalon(SalonTeamMember $member, ProfessionalProfile $salon): void
    {
        abort_unless((int) $member->salon_profile_id === (int) $salon->id, 404);
    }
}
