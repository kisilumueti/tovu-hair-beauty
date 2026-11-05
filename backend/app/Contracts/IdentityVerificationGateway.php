<?php

namespace App\Contracts;

use App\DTO\IdentityVerificationResult;
use App\Models\User;

interface IdentityVerificationGateway
{
    /**
     * Send an identity number to an approved provider for a one-time verification.
     * Implementations must never persist or log the supplied number.
     */
    public function verify(string $nationalId, User $subject): IdentityVerificationResult;
}
