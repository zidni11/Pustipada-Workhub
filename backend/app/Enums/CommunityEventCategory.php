<?php

namespace App\Enums;

enum CommunityEventCategory: string
{
    case MEETING = 'meeting';
    case LUNCH = 'lunch';
    case CELEBRATION = 'celebration';
    case OTHER = 'other';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function label(): string
    {
        return match ($this) {
            self::MEETING => 'Meeting',
            self::LUNCH => 'Lunch Bareng',
            self::CELEBRATION => 'Acara 17-an',
            self::OTHER => 'Lainnya',
        };
    }
}
