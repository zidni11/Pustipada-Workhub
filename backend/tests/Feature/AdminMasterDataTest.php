<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Division;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminMasterDataTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_division(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson('/api/divisions', [
            'name' => 'Divisi Koleksi',
            'code' => 'KOLEKSI',
            'description' => 'Mengelola koleksi pustaka.',
        ])->assertCreated()
            ->assertJsonPath('data.code', 'KOLEKSI')
            ->assertJsonPath('data.is_active', true);

        $this->assertDatabaseHas('divisions', ['code' => 'KOLEKSI']);
    }

    public function test_pimpinan_cannot_create_division(): void
    {
        Sanctum::actingAs(User::factory()->pimpinan()->create());

        $this->postJson('/api/divisions', [
            'name' => 'Divisi Baru',
            'code' => 'BARU',
        ])->assertForbidden();
    }

    public function test_admin_can_create_user(): void
    {
        $division = Division::factory()->create();

        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson('/api/users', [
            'name' => 'Anggota Baru',
            'email' => 'baru@example.com',
            'password' => 'rahasia123',
            'role' => UserRole::ANGGOTA->value,
            'division_id' => $division->id,
        ])->assertCreated()
            ->assertJsonPath('data.email', 'baru@example.com')
            ->assertJsonPath('data.role', 'anggota');

        $user = User::where('email', 'baru@example.com')->firstOrFail();

        $this->assertTrue(Hash::check('rahasia123', $user->password));
    }

    public function test_pimpinan_can_list_users_but_cannot_create_them(): void
    {
        Sanctum::actingAs(User::factory()->pimpinan()->create());

        $this->getJson('/api/users')->assertOk();

        $this->postJson('/api/users', [
            'name' => 'Tidak Boleh',
            'email' => 'tidak@example.com',
            'password' => 'rahasia123',
            'role' => UserRole::ANGGOTA->value,
        ])->assertForbidden();
    }

    public function test_admin_cannot_access_tasks(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->getJson('/api/tasks')->assertForbidden();
    }

    public function test_division_with_users_cannot_be_deleted(): void
    {
        $division = Division::factory()->create();
        User::factory()->create(['division_id' => $division->id]);

        Sanctum::actingAs(User::factory()->admin()->create());

        $this->deleteJson("/api/divisions/{$division->id}")
            ->assertUnprocessable();
    }

    public function test_admin_can_delete_empty_division(): void
    {
        $division = Division::factory()->create();

        Sanctum::actingAs(User::factory()->admin()->create());

        $this->deleteJson("/api/divisions/{$division->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('divisions', ['id' => $division->id]);
    }
}
