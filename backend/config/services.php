<?php

return [
    'frontend' => [
        'url' => env('FRONTEND_URL', 'http://localhost:5173'),
    ],
    'identity_verification' => [
        'driver' => env('IDENTITY_VERIFICATION_DRIVER', 'unavailable'),
        'consent_version' => env('IDENTITY_CONSENT_VERSION', '2026-11-05'),
    ],
];
