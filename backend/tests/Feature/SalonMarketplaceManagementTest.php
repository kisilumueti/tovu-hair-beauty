<?php

namespace Tests\Feature;

use App\Models\ProfessionalProfile;
use App\Models\SalonTeamInvitation;
use App\Models\SalonTeamMember;
use App\Models\Service;
use App\Models\User;
use App\Notifications\SalonTeamInvitationNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Tests\TestCase;

class SalonMarketplaceManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_salon_owner_can_create_a_service_and_publish_it_to_the_public_catalogue(): void
    {
        [$owner, $salon] = $this->createProfessional(User::ROLE_SALON, 'owner@example.test');

        $response = $this->actingAs($owner)->postJson('/api/v1/professional/services', [
            'name' => 'Protective braids',
            'category' => 'Braids',
            'description' => 'A professional protective styling appointment.',
            'price_minor' => 250000,
            'duration_minutes' => 120,
            'buffer_before_minutes' => 10,
            'buffer_after_minutes' => 15,
            'is_active' => true,
            'requires_consultation' => false,
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'Protective braids')
            ->assertJsonPath('data.price_minor', 250000)
            ->assertJsonPath('data.currency', 'KES');

        $this->assertDatabaseHas('services', [
            'professional_profile_id' => $salon->id,
            'name' => 'Protective braids',
            'price_minor' => 250000,
            'is_active' => true,
        ]);

        $this->getJson('/api/v1/professionals/'.$salon->id.'/services')
            ->assertOk()
            ->assertJsonPath('data.0.name', 'Protective braids');
    }

    public function test_professional_cannot_modify_another_professionals_service(): void
    {
        [$salonOwner, $salon] = $this->createProfessional(User::ROLE_SALON, 'owner2@example.test');
        [$otherOwner] = $this->createProfessional(User::ROLE_STYLIST, 'stylist@example.test');

        $service = Service::query()->create([
            'professional_profile_id' => $salon->id,
            'name' => 'Salon service',
            'slug' => 'salon-service',
            'category' => 'Hair',
            'price_minor' => 10000,
            'currency' => 'KES',
            'duration_minutes' => 60,
            'is_active' => true,
        ]);

        $this->actingAs($otherOwner)
            ->patchJson('/api/v1/professional/services/'.$service->id, [
                'name' => 'Unauthorized change',
            ])
            ->assertNotFound();

        $this->assertDatabaseHas('services', [
            'id' => $service->id,
            'name' => 'Salon service',
        ]);
    }

    public function test_salon_owner_can_send_a_team_invitation_without_exposing_the_token_in_the_response(): void
    {
        config(['mail.default' => 'smtp']);
        Notification::fake();

        [$owner] = $this->createProfessional(User::ROLE_SALON, 'salon-owner@example.test');

        $response = $this->actingAs($owner)->postJson('/api/v1/salon/team/invitations', [
            'email' => 'stylist.invitee@example.test',
            'role' => SalonTeamMember::ROLE_STYLIST,
        ]);

        $response->assertAccepted()
            ->assertJsonPath('data.email', 'stylist.invitee@example.test')
            ->assertJsonPath('data.role', 'stylist')
            ->assertJsonMissingPath('data.token');

        Notification::assertSentOnDemand(SalonTeamInvitationNotification::class);

        $this->assertDatabaseHas('salon_team_invitations', [
            'email' => 'stylist.invitee@example.test',
            'role' => 'stylist',
        ]);
    }

    public function test_salon_invitation_is_not_created_when_only_a_log_mailer_is_configured(): void
    {
        config(['mail.default' => 'log']);

        [$owner] = $this->createProfessional(User::ROLE_SALON, 'salon-log@example.test');

        $this->actingAs($owner)->postJson('/api/v1/salon/team/invitations', [
            'email' => 'no-log-token@example.test',
            'role' => 'stylist',
        ])->assertStatus(503);

        $this->assertDatabaseCount('salon_team_invitations', 0);
    }

    public function test_stylist_can_accept_a_matching_unexpired_salon_invitation_only_once(): void
    {
        [$owner, $salon] = $this->createProfessional(User::ROLE_SALON, 'accept-owner@example.test');
        [$stylist] = $this->createProfessional(User::ROLE_STYLIST, 'accept-stylist@example.test');
        $token = Str::random(64);

        $invitation = SalonTeamInvitation::query()->create([
            'salon_profile_id' => $salon->id,
            'email' => $stylist->email,
            'role' => SalonTeamMember::ROLE_STYLIST,
            'token_hash' => hash('sha256', $token),
            'invited_by_user_id' => $owner->id,
            'expires_at' => now()->addDays(3),
        ]);

        $this->actingAs($stylist)
            ->postJson('/api/v1/salon/team/invitations/accept', ['token' => $token])
            ->assertCreated()
            ->assertJsonPath('data.role', 'stylist');

        $this->assertDatabaseHas('salon_team_members', [
            'salon_profile_id' => $salon->id,
            'user_id' => $stylist->id,
            'role' => 'stylist',
            'status' => 'active',
        ]);

        $this->assertNotNull($invitation->fresh()->accepted_at);

        $this->actingAs($stylist)
            ->postJson('/api/v1/salon/team/invitations/accept', ['token' => $token])
            ->assertUnprocessable();

        $this->assertDatabaseCount('salon_team_members', 1);
    }

    public function test_independent_stylist_cannot_access_salon_owner_team_management(): void
    {
        [$stylist] = $this->createProfessional(User::ROLE_STYLIST, 'independent@example.test');

        $this->actingAs($stylist)
            ->getJson('/api/v1/salon/team')
            ->assertForbidden();
    }

    /**
     * Create synthetic test accounts and their professional profiles.
     *
     * @return array{User, ProfessionalProfile}
     */
    private function createProfessional(string $role, string $email): array
    {
        $user = User::query()->create([
            'name' => 'Synthetic '.$role,
            'email' => $email,
            'password' => 'test-password-that-is-long-enough',
            'role' => $role,
            'status' => 'active',
        ]);

        $profile = ProfessionalProfile::query()->create([
            'user_id' => $user->id,
            'type' => $role,
            'business_name' => 'Synthetic '.$role.' profile',
            'location' => 'Nairobi',
            'verification_status' => 'pending',
        ]);

        return [$user, $profile];
    }
}
