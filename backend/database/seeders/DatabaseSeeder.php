<?php

namespace Database\Seeders;

use App\Enums\TaskStatus;
use App\Enums\UserRole;
use App\Models\Division;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $umum = Division::firstOrCreate(
            ['code' => 'UMUM'],
            ['name' => 'Divisi Umum', 'description' => 'Administrasi dan operasional umum.'],
        );

        $layanan = Division::firstOrCreate(
            ['code' => 'LAYANAN'],
            ['name' => 'Divisi Layanan', 'description' => 'Layanan pustaka dan pengguna.'],
        );

        $admin = User::firstOrCreate(
            ['email' => 'admin@pustipada.test'],
            [
                'name' => 'Admin Workhub',
                'password' => 'password',
                'role' => UserRole::ADMIN,
                'division_id' => null,
                'is_active' => true,
            ],
        );

        $pimpinan = User::firstOrCreate(
            ['email' => 'pimpinan@pustipada.test'],
            [
                'name' => 'Pimpinan Pustipada',
                'password' => 'password',
                'role' => UserRole::PIMPINAN,
                'division_id' => $layanan->id,
                'is_active' => true,
            ],
        );

        $anggota = User::firstOrCreate(
            ['email' => 'anggota@pustipada.test'],
            [
                'name' => 'Anggota Layanan',
                'password' => 'password',
                'role' => UserRole::ANGGOTA,
                'division_id' => $layanan->id,
                'is_active' => true,
            ],
        );

        User::firstOrCreate(
            ['email' => 'anggota.umum@pustipada.test'],
            [
                'name' => 'Anggota Umum',
                'password' => 'password',
                'role' => UserRole::ANGGOTA,
                'division_id' => $umum->id,
                'is_active' => true,
            ],
        );

        Task::firstOrCreate(
            ['title' => 'Input katalog buku baru'],
            [
                'description' => 'Masukkan data buku baru ke katalog perpustakaan.',
                'status' => TaskStatus::IN_PROGRESS,
                'priority' => 'high',
                'division_id' => $layanan->id,
                'creator_id' => $pimpinan->id,
                'pic_id' => $anggota->id,
                'due_date' => now()->addDays(7)->toDateString(),
            ],
        );

        Task::firstOrCreate(
            ['title' => 'Review kebijakan layanan'],
            [
                'description' => 'Draft kebijakan layanan baru untuk dibahas bersama pimpinan.',
                'status' => TaskStatus::DRAFT,
                'priority' => 'medium',
                'division_id' => $layanan->id,
                'creator_id' => $pimpinan->id,
                'due_date' => now()->addDays(14)->toDateString(),
            ],
        );

        Task::firstOrCreate(
            ['title' => 'Update SOP arsip'],
            [
                'description' => 'Perbarui SOP pengarsipan dokumen fisik.',
                'status' => TaskStatus::OPEN,
                'priority' => 'low',
                'division_id' => $umum->id,
                'creator_id' => $pimpinan->id,
                'due_date' => now()->addDays(21)->toDateString(),
            ],
        );
    }
}
