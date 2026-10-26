<?php

namespace App\Enums;

enum UserRole: string
{
    case ADMIN = 'admin';
    case PIMPINAN = 'pimpinan';
    case ANGGOTA = 'anggota';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function canManageMasterData(): bool
    {
        return $this === self::ADMIN;
    }

    public function canManageTasks(): bool
    {
        return $this === self::PIMPINAN;
    }
}
