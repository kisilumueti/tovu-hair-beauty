<?php

namespace App\Providers;

use App\Contracts\IdentityVerificationGateway;
use App\Services\UnavailableIdentityVerificationGateway;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            IdentityVerificationGateway::class,
            UnavailableIdentityVerificationGateway::class,
        );
    }

    public function boot(): void
    {
        RateLimiter::for('api', function (Request $request): Limit {
            $userId = $request->user()?->getAuthIdentifier();
            $key = $userId ? 'user:'.$userId : 'ip:'.$request->ip();

            return Limit::perMinute(120)->by($key);
        });

        RateLimiter::for('auth', function (Request $request): Limit {
            $identity = hash(
                'sha256',
                Str::lower((string) $request->input('email')).'|'.$request->ip(),
            );

            return Limit::perMinute(5)->by($identity);
        });

        RateLimiter::for('identity', function (Request $request): Limit {
            $identity = (string) ($request->user()?->getAuthIdentifier() ?? $request->ip());

            return Limit::perMinute(3)->by($identity);
        });
    }
}
