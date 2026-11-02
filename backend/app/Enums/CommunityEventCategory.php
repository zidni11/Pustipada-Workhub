<?php

namespace App\Enums;

enum CommunityEventCategory: string
{
    case MEETING = 'meeting';
    case LUNCH = 'lunch';
    case CELEBRATION = 'celebration';
    case PENGUMUMAN = 'pengumuman';
    case KEGIATAN_KANTOR = 'kegiatan_kantor';
    case OTHER = 'other';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function labelFor(string $value): string
    {
        return self::tryFrom($value)?->label() ?? $value;
    }

    public function label(): string
    {
        return match ($this) {
            self::MEETING => 'Meeting',
            self::LUNCH => 'Lunch break',
            self::CELEBRATION => 'Acara perayaan',
            self::PENGUMUMAN => 'Pengumuman',
            self::KEGIATAN_KANTOR => 'Kegiatan Kantor',
            self::OTHER => 'Lainnya',
        };
    }
}
