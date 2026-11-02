<?php

namespace Database\Factories;

use App\Enums\CommunityEventCategory;
use App\Models\CommunityEvent;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CommunityEvent>
 */
class CommunityEventFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $start = fake()->dateTimeBetween('now', '+1 month');

        return [
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'category' => fake()->randomElement(CommunityEventCategory::values()),
            'location' => fake()->optional()->city(),
            'start_at' => $start,
            'end_at' => fake()->optional()->dateTimeBetween($start, '+2 months'),
            'division_id' => null,
            'created_by' => User::factory()->admin(),
        ];
    }
}
