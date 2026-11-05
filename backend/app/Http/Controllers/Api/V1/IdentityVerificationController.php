<?php

namespace App\Http\Controllers\Api\V1;

use App\Contracts\IdentityVerificationGateway;
use App\Exceptions\IdentityVerificationUnavailable;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\IdentityVerificationAttempt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class IdentityVerificationController extends Controller
{
    public function __invoke(Request $request, IdentityVerificationGateway $gateway): JsonResponse
    {
        $user = $request->user();

        if (!$user->isProfessional()) {
            return response()->json(['message' => 'Only professional accounts can request identity verification.'], 403);
        }

        $data = $request->validate([
            'national_id' => ['required', 'string', 'regex:/^\\d{7,8}$/'],
            'consent' => ['required', 'accepted'],
        ]);

        try {
            $result = $gateway->verify($data['national_id'], $user);
        } catch (IdentityVerificationUnavailable) {
            DB::transaction(function () use ($request, $user): void {
                IdentityVerificationAttempt::query()->create([
                    'user_id' => $user->id,
                    'provider' => 'unconfigured',
                    'status' => 'unavailable',
                    'consent_version' => (string) config('services.identity_verification.consent_version'),
                    'submitted_at' => now(),
                ]);

                AuditLog::query()->create([
                    'actor_user_id' => $user->id,
                    'event' => 'identity_verification.unavailable',
                    'subject_type' => $user::class,
                    'subject_id' => (string) $user->id,
                    'request_id' => $request->attributes->get('request_id'),
                    'metadata' => ['reason' => 'provider_not_configured'],
                    'created_at' => now(),
                ]);
            });

            return response()->json([
                'message' => 'Identity verification is not available yet. No identity number was retained. Please try again after TOVU configures an approved provider.',
                'request_id' => $request->attributes->get('request_id'),
            ], 503);
        }

        DB::transaction(function () use ($request, $user, $result): void {
            IdentityVerificationAttempt::query()->create([
                'user_id' => $user->id,
                'provider' => $result->provider,
                'external_reference' => $result->reference,
                'status' => $result->status,
                'consent_version' => (string) config('services.identity_verification.consent_version'),
                'submitted_at' => now(),
                'verified_at' => $result->verifiedAt,
            ]);

            if ($result->status === 'verified') {
                $user->professionalProfile()->update([
                    'verification_status' => 'verified',
                    'verified_at' => $result->verifiedAt ?? now(),
                ]);
            }

            AuditLog::query()->create([
                'actor_user_id' => $user->id,
                'event' => 'identity_verification.'.$result->status,
                'subject_type' => $user::class,
                'subject_id' => (string) $user->id,
                'request_id' => $request->attributes->get('request_id'),
                'metadata' => [
                    'provider' => $result->provider,
                    'reference_present' => $result->reference !== null,
                ],
                'created_at' => now(),
            ]);
        });

        return response()->json([
            'data' => [
                'status' => $result->status,
                'verification_reference' => $result->reference,
            ],
        ], 202);
    }
}
