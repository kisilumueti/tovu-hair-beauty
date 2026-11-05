<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterRequest;
use App\Models\AuditLog;
use App\Models\ProfessionalProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();

        [$user, $token] = DB::transaction(function () use ($data, $request): array {
            $user = User::query()->create([
                'name' => $data['name'],
                'email' => mb_strtolower($data['email']),
                'phone' => $data['phone'] ?? null,
                'password' => Hash::make($data['password']),
                'role' => $data['role'],
                'status' => 'active',
            ]);

            if ($user->isProfessional()) {
                ProfessionalProfile::query()->create([
                    'user_id' => $user->id,
                    'type' => $user->role,
                    'business_name' => $data['business_name'],
                    'location' => $data['location'],
                    'bio' => $data['bio'] ?? null,
                    'verification_status' => 'pending',
                ]);
            }

            AuditLog::query()->create([
                'actor_user_id' => $user->id,
                'event' => 'auth.registered',
                'subject_type' => $user::class,
                'subject_id' => (string) $user->id,
                'request_id' => $request->attributes->get('request_id'),
                'metadata' => ['role' => $user->role],
                'created_at' => now(),
            ]);

            return [$user, $user->createToken('tovu-web')->plainTextToken];
        });

        return response()->json([
            'data' => [
                'user' => $this->userPayload($user),
                'token' => $token,
                'token_type' => 'Bearer',
            ],
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email:rfc', 'max:255'],
            'password' => ['required', 'string', 'max:1024'],
        ]);

        $user = User::query()
            ->where('email', mb_strtolower($credentials['email']))
            ->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The supplied credentials are invalid.'],
            ]);
        }

        if ($user->status !== 'active') {
            return response()->json(['message' => 'This account is not active.'], 403);
        }

        AuditLog::query()->create([
            'actor_user_id' => $user->id,
            'event' => 'auth.logged_in',
            'subject_type' => $user::class,
            'subject_id' => (string) $user->id,
            'request_id' => $request->attributes->get('request_id'),
            'metadata' => [],
            'created_at' => now(),
        ]);

        return response()->json([
            'data' => [
                'user' => $this->userPayload($user),
                'token' => $user->createToken('tovu-web')->plainTextToken,
                'token_type' => 'Bearer',
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['data' => ['user' => $this->userPayload($request->user())]]);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        AuditLog::query()->create([
            'actor_user_id' => $user->id,
            'event' => 'auth.logged_out',
            'subject_type' => $user::class,
            'subject_id' => (string) $user->id,
            'request_id' => $request->attributes->get('request_id'),
            'metadata' => [],
            'created_at' => now(),
        ]);

        $user->currentAccessToken()?->delete();

        return response()->json(['message' => 'Signed out successfully.']);
    }

    private function userPayload(User $user): array
    {
        $profile = $user->professionalProfile;

        return [
            'id' => (string) $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role,
            'professional_profile' => $profile ? [
                'id' => (string) $profile->id,
                'type' => $profile->type,
                'business_name' => $profile->business_name,
                'location' => $profile->location,
                'verification_status' => $profile->verification_status,
            ] : null,
        ];
    }
}
