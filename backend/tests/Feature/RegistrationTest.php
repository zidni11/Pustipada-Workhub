<?php

namespace Tests\Feature;

use App\Models\Division;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_divisions_only_returns_active_divisions_with_public_fields(): void
    {
        Division::factory()->create([
            'name' => 'Divisi Aktif',
            'code' => 'AKTIF',
            'is_active' => true,
        ]);

        Division::factory()->create([
            'name' => 'Divisi Nonaktif',
            'code' => 'NONAKTIF',
            'is_active' => false,
        ]);

        $this->getJson('/api/divisions/public')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Divisi Aktif')
            ->assertJsonPath('data.0.code', 'AKTIF')
            ->assertJsonStructure([
                'data' => [
                    ['id', 'name', 'code'],
                ],
            ])
            ->assertJsonMissingPath('data.0.description')
            ->assertJsonMissingPath('data.0.is_active');
    }

    public function test_user_can_register_as_inactive_anggota_without_token(): void
    {
        $division = Division::factory()->create();

        $response = $this->postJson('/api/auth/register', [
            'name' => 'Calon Anggota',
            'email' => 'calon@example.com',
            'password' => 'rahasia123',
            'password_confirmation' => 'rahasia123',
            'division_id' => $division->id,
        ]);

        $response->assertCreated()
            ->assertExactJson([
                'message' => 'Pendaftaran berhasil. Silakan tunggu aktivasi akun oleh Admin.',
            ]);

        $user = User::where('email', 'calon@example.com')->firstOrFail();

        $this->assertSame('anggota', $user->role->value);
        $this->assertFalse($user->is_active);
        $this->assertSame($division->id, $user->division_id);
        $this->assertTrue(Hash::check('rahasia123', $user->password));
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_registration_requires_unique_email(): void
    {
        $division = Division::factory()->create();

        User::factory()->create(['email' => 'sudah@example.com']);

        $this->postJson('/api/auth/register', [
            'name' => 'Duplikat',
            'email' => 'sudah@example.com',
            'password' => 'rahasia123',
            'password_confirmation' => 'rahasia123',
            'division_id' => $division->id,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_registration_requires_matching_password_confirmation(): void
    {
        $division = Division::factory()->create();

        $this->postJson('/api/auth/register', [
            'name' => 'Password Beda',
            'email' => 'beda@example.com',
            'password' => 'rahasia123',
            'password_confirmation' => 'rahasia456',
            'division_id' => $division->id,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('password');
    }

    public function test_registration_requires_existing_division(): void
    {
        $this->postJson('/api/auth/register', [
            'name' => 'Tanpa Divisi',
            'email' => 'divisi@example.com',
            'password' => 'rahasia123',
            'password_confirmation' => 'rahasia123',
            'division_id' => 9999,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('division_id');
    }
}
