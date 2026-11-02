<?php

namespace Tests\Feature;

use App\Models\CommunityEvent;
use App\Models\Division;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CalendarTest extends TestCase
{
    use RefreshDatabase;

    public function test_calendar_combines_visible_tasks_events_and_seven_day_reminders(): void
    {
        Carbon::setTestNow('2026-11-15 10:00:00');

        try {
            $division = Division::factory()->create();
            $pimpinan = User::factory()->pimpinan()->create(['division_id' => $division->id]);
            $pic = User::factory()->anggota()->create(['division_id' => $division->id]);
            $admin = User::factory()->admin()->create();

            $task = Task::factory()->forDivision($division)->create([
                'creator_id' => $pimpinan->id,
                'pic_id' => $pic->id,
                'due_date' => '2026-11-18',
            ]);

            Task::factory()->forDivision($division)->create([
                'creator_id' => $pimpinan->id,
                'pic_id' => $pic->id,
                'due_date' => '2026-12-01',
            ]);

            $event = CommunityEvent::factory()->create([
                'created_by' => $admin->id,
                'start_at' => '2026-11-20 09:00:00',
                'end_at' => '2026-11-20 11:00:00',
            ]);

            CommunityEvent::factory()->create([
                'created_by' => $admin->id,
                'start_at' => '2026-12-05 09:00:00',
            ]);

            Sanctum::actingAs($pic);

            $this->getJson('/api/calendar?month=2026-11')
                ->assertOk()
                ->assertJsonPath('month', '2026-11')
                ->assertJsonCount(1, 'tasks')
                ->assertJsonPath('tasks.0.id', $task->id)
                ->assertJsonCount(1, 'events')
                ->assertJsonPath('events.0.id', $event->id)
                ->assertJsonCount(2, 'upcoming_reminders');

            Sanctum::actingAs($admin);

            $this->getJson('/api/calendar?month=2026-11')
                ->assertOk()
                ->assertJsonCount(0, 'tasks')
                ->assertJsonCount(1, 'events')
                ->assertJsonCount(1, 'upcoming_reminders')
                ->assertJsonPath('upcoming_reminders.0.type', 'event');
        } finally {
            Carbon::setTestNow();
        }
    }

    public function test_calendar_respects_division_event_visibility(): void
    {
        Carbon::setTestNow('2026-11-15 10:00:00');

        try {
            $divisionA = Division::factory()->create();
            $divisionB = Division::factory()->create();
            $admin = User::factory()->admin()->create();
            $memberA = User::factory()->anggota()->create(['division_id' => $divisionA->id]);

            $global = CommunityEvent::factory()->create([
                'created_by' => $admin->id,
                'start_at' => '2026-11-21 09:00:00',
            ]);
            $eventA = CommunityEvent::factory()->create([
                'created_by' => $admin->id,
                'start_at' => '2026-11-22 09:00:00',
                'division_id' => $divisionA->id,
            ]);
            CommunityEvent::factory()->create([
                'created_by' => $admin->id,
                'start_at' => '2026-11-23 09:00:00',
                'division_id' => $divisionB->id,
            ]);

            Sanctum::actingAs($memberA);

            $response = $this->getJson('/api/calendar?month=2026-11')->assertOk();
            $ids = collect($response->json('events'))->pluck('id');

            $this->assertTrue($ids->contains($global->id));
            $this->assertTrue($ids->contains($eventA->id));
            $this->assertCount(2, $ids);
        } finally {
            Carbon::setTestNow();
        }
    }
}
