<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\IdentityVerificationController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::middleware('throttle:auth')->group(function (): void {
        Route::post('/auth/register', [AuthController::class, 'register']);
        Route::post('/auth/login', [AuthController::class, 'login']);
    });

    Route::get('/professionals/{professional}/services', [ServiceController::class, 'index'])->whereNumber('professional');

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::delete('/auth/logout', [AuthController::class, 'logout']);

        Route::post('/professional/identity-verification', IdentityVerificationController::class)
            ->middleware(['throttle:identity', 'role:stylist,salon']);

        Route::post('/salon/team/invitations/accept', [SalonTeamController::class, 'acceptInvitation'])
            ->middleware('role:stylist');

        Route::prefix('salon')->middleware('role:salon')->group(function (): void {
            Route::get('/team', [SalonTeamController::class, 'index']);
            Route::post('/team/invitations', [SalonTeamController::class, 'invite'])->middleware('throttle:auth');
            Route::patch('/team/{member}/role', [SalonTeamController::class, 'updateRole'])->whereNumber('member');
            Route::delete('/team/{member}', [SalonTeamController::class, 'suspend'])->whereNumber('member');
        });

        Route::prefix('professional')->middleware('role:stylist,salon')->group(function (): void {
            Route::post('/services', [ServiceController::class, 'store']);
            Route::patch('/services/{service}', [ServiceController::class, 'update'])->whereNumber('service');
            Route::delete('/services/{service}', [ServiceController::class, 'archive'])->whereNumber('service');
        });
    });
});
