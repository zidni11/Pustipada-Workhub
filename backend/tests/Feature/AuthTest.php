<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->pimpinan()->create([
            'email' => 'pimpinan@example.com',
            'password' => 'password',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'pimpinan@example.com',
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'token',
                'token_type',
                'user' => ['id', 'name', 'email', 'role', 'is_active'],
            ])
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.role', 'pimpinan');

        $this->assertDatabaseCount('personal_access_tokens', 1);
    }

    public function test_user_cannot_login_with_wrong_password(): void
    {
        User::factory()->create(['email' => 'user@example.com']);

        $this->postJson('/api/auth/login', [
            'email' => 'user@example.com',
            'password' => 'password-salah',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('email');

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_inactive_user_cannot_login(): void
    {
        User::factory()->inactive()->create([
            'email' => 'nonaktif@example.com',
            'password' => 'password',
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'nonaktif@example.com',
            'password' => 'password',
        ])->assertForbidden();
    }

    public function test_user_can_logout_and_revoke_token(): void
    {
        $user = User::factory()->create();

        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/auth/logout')
            ->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_token_of_deactivated_user_is_rejected(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $user->update(['is_active' => false]);

        $this->withToken($token)
            ->getJson('/api/auth/me')
            ->assertForbidden();
    }
}
