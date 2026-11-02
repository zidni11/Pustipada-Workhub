<?php

namespace Tests\Feature;

use App\Models\CommunityEvent;
use App\Models\Division;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CommunityEventTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_and_pimpinan_can_manage_events(): void
    {
        $admin = User::factory()->admin()->create();
        $pimpinan = User::factory()->pimpinan()->create();

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/events', [
            'title' => 'Rapat bulanan',
            'description' => 'Evaluasi kegiatan bulan ini.',
            'category' => 'meeting',
            'location' => 'Ruang rapat',
            'start_at' => now()->addDay()->toDateTimeString(),
            'end_at' => now()->addDay()->addHour()->toDateTimeString(),
        ])->assertCreated()
            ->assertJsonPath('data.category', 'meeting')
            ->assertJsonPath('data.category_label', 'Meeting');

        $eventId = $response->json('data.id');

        Sanctum::actingAs($pimpinan);

        $this->patchJson("/api/events/{$eventId}", [
            'title' => 'Rapat bulanan diperbarui',
            'category' => 'other',
        ])->assertOk()
            ->assertJsonPath('data.title', 'Rapat bulanan diperbarui')
            ->assertJsonPath('data.category', 'other');

        $this->deleteJson("/api/events/{$eventId}")->assertNoContent();

        $this->assertDatabaseMissing('community_events', ['id' => $eventId]);
    }

    public function test_admin_and_pimpinan_can_use_custom_categories(): void
    {
        $admin = User::factory()->admin()->create();
        $pimpinan = User::factory()->pimpinan()->create();

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/events', [
            'title' => 'Workshop desain',
            'category' => 'Workshop Internal',
            'start_at' => now()->addDay()->toDateTimeString(),
        ])->assertCreated()
            ->assertJsonPath('data.category', 'Workshop Internal')
            ->assertJsonPath('data.category_label', 'Workshop Internal');

        $eventId = $response->json('data.id');

        Sanctum::actingAs($pimpinan);

        $this->patchJson("/api/events/{$eventId}", [
            'category' => 'Rapat Koordinasi',
        ])->assertOk()
            ->assertJsonPath('data.category', 'Rapat Koordinasi')
            ->assertJsonPath('data.category_label', 'Rapat Koordinasi');
    }

    public function test_event_categories_include_defaults_and_used_custom_categories(): void
    {
        $admin = User::factory()->admin()->create();

        CommunityEvent::factory()->create([
            'category' => 'Workshop Internal',
            'created_by' => $admin->id,
        ]);
        CommunityEvent::factory()->create([
            'category' => 'Workshop Internal',
            'created_by' => $admin->id,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/events/categories')->assertOk();
        $options = collect($response->json('data'));
        $values = $options->pluck('value');

        $this->assertTrue($values->contains('meeting'));
        $this->assertTrue($values->contains('pengumuman'));
        $this->assertTrue($values->contains('kegiatan_kantor'));
        $this->assertTrue($values->contains('Workshop Internal'));
        $this->assertSame(1, $values->filter(fn ($value) => $value === 'Workshop Internal')->count());
        $this->assertSame('Pengumuman', $options->firstWhere('value', 'pengumuman')['label']);
    }

    public function test_event_category_must_be_a_string_within_the_length_limit(): void
    {
        $admin = User::factory()->admin()->create();

        Sanctum::actingAs($admin);

        $this->postJson('/api/events', [
            'title' => 'Acara',
            'category' => str_repeat('a', 61),
            'start_at' => now()->addDay()->toDateTimeString(),
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('category');

        $this->postJson('/api/events', [
            'title' => 'Acara',
            'category' => '',
            'start_at' => now()->addDay()->toDateTimeString(),
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('category');
    }

    public function test_anggota_cannot_manage_events(): void
    {
        $anggota = User::factory()->anggota()->create();

        Sanctum::actingAs($anggota);

        $this->postJson('/api/events', [
            'title' => 'Acara',
            'category' => 'other',
            'start_at' => now()->addDay()->toDateTimeString(),
        ])->assertForbidden();
    }

    public function test_event_visibility_uses_global_and_own_division_scope(): void
    {
        $divisionA = Division::factory()->create();
        $divisionB = Division::factory()->create();
        $admin = User::factory()->admin()->create();
        $pimpinan = User::factory()->pimpinan()->create(['division_id' => $divisionA->id]);
        $memberA = User::factory()->anggota()->create(['division_id' => $divisionA->id]);
        $memberB = User::factory()->anggota()->create(['division_id' => $divisionB->id]);

        $global = CommunityEvent::factory()->create(['created_by' => $admin->id]);
        $eventA = CommunityEvent::factory()->create([
            'created_by' => $pimpinan->id,
            'division_id' => $divisionA->id,
        ]);
        $eventB = CommunityEvent::factory()->create([
            'created_by' => $pimpinan->id,
            'division_id' => $divisionB->id,
        ]);

        Sanctum::actingAs($memberA);

        $idsA = collect($this->getJson('/api/events')->assertOk()->json('data'))->pluck('id');
        $this->assertTrue($idsA->contains($global->id));
        $this->assertTrue($idsA->contains($eventA->id));
        $this->assertFalse($idsA->contains($eventB->id));

        Sanctum::actingAs($memberB);

        $idsB = collect($this->getJson('/api/events')->assertOk()->json('data'))->pluck('id');
        $this->assertTrue($idsB->contains($global->id));
        $this->assertTrue($idsB->contains($eventB->id));
        $this->assertFalse($idsB->contains($eventA->id));

        Sanctum::actingAs($pimpinan);

        $this->getJson('/api/events')
            ->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_global_event_notifies_all_active_users_except_creator(): void
    {
        $admin = User::factory()->admin()->create();
        $pimpinan = User::factory()->pimpinan()->create();
        $memberA = User::factory()->anggota()->create();
        $inactive = User::factory()->anggota()->inactive()->create();

        Sanctum::actingAs($admin);

        $this->postJson('/api/events', [
            'title' => 'Lunch bareng',
            'category' => 'lunch',
            'start_at' => now()->addDays(2)->toDateTimeString(),
        ])->assertCreated();

        $this->assertDatabaseHas('user_notifications', [
            'user_id' => $pimpinan->id,
            'type' => 'event_created',
        ]);
        $this->assertDatabaseHas('user_notifications', [
            'user_id' => $memberA->id,
            'type' => 'event_created',
        ]);
        $this->assertDatabaseMissing('user_notifications', [
            'user_id' => $admin->id,
            'type' => 'event_created',
        ]);
        $this->assertDatabaseMissing('user_notifications', [
            'user_id' => $inactive->id,
            'type' => 'event_created',
        ]);
    }

    public function test_division_event_notifies_division_and_leaders_only(): void
    {
        $divisionA = Division::factory()->create();
        $divisionB = Division::factory()->create();
        $admin = User::factory()->admin()->create();
        $pimpinan = User::factory()->pimpinan()->create(['division_id' => $divisionA->id]);
        $memberA = User::factory()->anggota()->create(['division_id' => $divisionA->id]);
        $memberB = User::factory()->anggota()->create(['division_id' => $divisionB->id]);

        Sanctum::actingAs($pimpinan);

        $this->postJson('/api/events', [
            'title' => 'Acara divisi',
            'category' => 'celebration',
            'start_at' => now()->addDays(3)->toDateTimeString(),
            'division_id' => $divisionA->id,
        ])->assertCreated();

        $this->assertDatabaseHas('user_notifications', [
            'user_id' => $admin->id,
            'type' => 'event_created',
        ]);
        $this->assertDatabaseHas('user_notifications', [
            'user_id' => $memberA->id,
            'type' => 'event_created',
        ]);
        $this->assertDatabaseMissing('user_notifications', [
            'user_id' => $memberB->id,
            'type' => 'event_created',
        ]);
        $this->assertDatabaseMissing('user_notifications', [
            'user_id' => $pimpinan->id,
            'type' => 'event_created',
        ]);
    }
}
