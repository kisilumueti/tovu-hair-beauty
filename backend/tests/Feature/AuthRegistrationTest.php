<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthRegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_register_and_receive_a_bearer_token(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test Customer',
            'email' => 'customer@example.test',
            'phone' => '+254700000001',
            'password' => 'correct-horse-battery',
            'password_confirmation' => 'correct-horse-battery',
            'role' => 'customer',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.user.role', 'customer')
            ->assertJsonPath('data.token_type', 'Bearer')
            ->assertJsonStructure(['data' => ['user' => ['id', 'name', 'email', 'role'], 'token']]);

        $this->assertDatabaseHas('users', [
            'email' => 'customer@example.test',
            'role' => 'customer',
        ]);
    }

    public function test_independent_stylist_registration_creates_an_unverified_profile(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test Stylist',
            'email' => 'stylist@example.test',
            'password' => 'correct-horse-battery',
            'password_confirmation' => 'correct-horse-battery',
            'role' => 'stylist',
            'business_name' => 'Test Studio',
            'location' => 'Nairobi',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.user.role', 'stylist')
            ->assertJsonPath('data.user.professional_profile.verification_status', 'pending');

        $this->assertDatabaseHas('professional_profiles', [
            'business_name' => 'Test Studio',
            'verification_status' => 'pending',
        ]);
    }

    public function test_registration_rejects_short_passwords_and_unknown_roles(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Invalid User',
            'email' => 'invalid@example.test',
            'password' => 'short',
            'password_confirmation' => 'short',
            'role' => 'administrator',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['password', 'role']);
    }

    public function test_identity_verification_is_unavailable_without_a_provider_and_does_not_retain_the_number(): void
    {
        $registration = $this->postJson('/api/v1/auth/register', [
            'name' => 'Verification Test Stylist',
            'email' => 'verification@example.test',
            'password' => 'correct-horse-battery',
            'password_confirmation' => 'correct-horse-battery',
            'role' => 'stylist',
            'business_name' => 'Verification Test Studio',
            'location' => 'Nairobi',
        ])->assertCreated();

        $token = $registration->json('data.token');

        $this->withToken($token)->postJson('/api/v1/professional/identity-verification', [
            'national_id' => '00000000',
            'consent' => true,
        ])->assertStatus(503)
          ->assertJsonPath('message', 'Identity verification is not available yet. No identity number was retained. Please try again after TOVU configures an approved provider.');

        $this->assertDatabaseHas('identity_verification_attempts', [
            'provider' => 'unconfigured',
            'status' => 'unavailable',
        ]);

        $this->assertDatabaseMissing('identity_verification_attempts', [
            'external_reference' => '00000000',
        ]);
    }
}
