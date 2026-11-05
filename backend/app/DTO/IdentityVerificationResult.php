<?php

namespace App\DTO;

use Carbon\CarbonImmutable;

final readonly class IdentityVerificationResult
{
    public function __construct(
        public string $provider,
        public ?string $reference,
        public string $status,
        public ?CarbonImmutable $verifiedAt = null,
    ) {
    }
}
