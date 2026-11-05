<?php

namespace App\Services;

use App\Contracts\IdentityVerificationGateway;
use App\DTO\IdentityVerificationResult;
use App\Exceptions\IdentityVerificationUnavailable;
use App\Models\User;

final class UnavailableIdentityVerificationGateway implements IdentityVerificationGateway
{
    public function verify(string $nationalId, User $subject): IdentityVerificationResult
    {
        // Deliberately do not log, hash, persist, or forward the supplied identity number.
        throw new IdentityVerificationUnavailable(
            'No approved identity-verification provider has been configured for TOVU.'
        );
    }
}
