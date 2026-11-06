<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salon_team_invitations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('salon_profile_id')->constrained('professional_profiles')->cascadeOnDelete();
            $table->string('email', 255);
            $table->string('role', 24);
            $table->char('token_hash', 64)->unique();
            $table->foreignId('invited_by_user_id')->constrained('users')->restrictOnDelete();
            $table->timestamp('expires_at')->index();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();

            $table->index(['salon_profile_id', 'email', 'accepted_at', 'revoked_at'], 'salon_invites_lookup_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salon_team_invitations');
    }
};
