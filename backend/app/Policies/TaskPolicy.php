<?php

namespace App\Policies;

use App\Enums\TaskStatus;
use App\Enums\UserRole;
use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, [UserRole::PIMPINAN, UserRole::ANGGOTA], true);
    }

    public function view(User $user, Task $task): bool
    {
        if ($user->role === UserRole::PIMPINAN) {
            return true;
        }

        if ($user->role !== UserRole::ANGGOTA) {
            return false;
        }

        if ($task->isAssignedTo($user)) {
            return true;
        }

        return $user->division_id !== null
            && $task->division_id === $user->division_id;
    }

    public function create(User $user): bool
    {
        return $user->role === UserRole::PIMPINAN;
    }

    public function update(User $user, Task $task): bool
    {
        return $user->role === UserRole::PIMPINAN;
    }

    public function delete(User $user, Task $task): bool
    {
        return $user->role === UserRole::PIMPINAN;
    }

    public function transitionTo(User $user, Task $task, TaskStatus $status): bool
    {
        if ($user->role === UserRole::PIMPINAN) {
            return true;
        }

        if ($user->role !== UserRole::ANGGOTA || ! $task->isAssignedTo($user)) {
            return false;
        }

        return in_array($status, [TaskStatus::IN_PROGRESS, TaskStatus::IN_REVIEW], true);
    }
}
