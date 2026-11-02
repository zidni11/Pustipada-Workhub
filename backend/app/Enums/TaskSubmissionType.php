<?php

namespace App\Enums;

enum TaskSubmissionType: string
{
    case FILE = 'file';
    case LINK = 'link';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function label(): string
    {
        return match ($this) {
            self::FILE => 'File',
            self::LINK => 'Tautan',
        };
    }
}
