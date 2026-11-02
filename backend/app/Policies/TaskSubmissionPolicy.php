<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\TaskSubmission;
use App\Models\User;

class TaskSubmissionPolicy
{
    public function delete(User $user, TaskSubmission $submission): bool
    {
        return $user->role === UserRole::ANGGOTA
            && $submission->task->pic_id === $user->id;
    }
}
