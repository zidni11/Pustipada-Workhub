<?php

namespace App\Models;

use App\Enums\TaskStatus;
use App\Enums\UserRole;
use Database\Factories\TaskFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'title',
    'description',
    'status',
    'priority',
    'division_id',
    'creator_id',
    'pic_id',
    'due_date',
    'completed_at',
])]
class Task extends Model
{
    /** @use HasFactory<TaskFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'status' => TaskStatus::class,
            'due_date' => 'date',
            'completed_at' => 'datetime',
        ];
    }

    public function division(): BelongsTo
    {
        return $this->belongsTo(Division::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function pic(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pic_id');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'task_members')
            ->withTimestamps();
    }

    public function activities(): HasMany
    {
        return $this->hasMany(TaskActivity::class)->latest();
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(TaskSubmission::class)->latest();
    }

    public function checklists(): HasMany
    {
        return $this->hasMany(TaskChecklist::class)->orderBy('created_at');
    }

    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        if ($user->role === UserRole::PIMPINAN) {
            return $query;
        }

        if ($user->role !== UserRole::ANGGOTA) {
            return $query->whereRaw('1 = 0');
        }

        return $query->where(function (Builder $query) use ($user) {
            if ($user->division_id !== null) {
                $query->where('division_id', $user->division_id);
            }

            $query->orWhere('pic_id', $user->id)
                ->orWhereHas('members', fn (Builder $members) => $members->where('users.id', $user->id));
        });
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->whereIn('status', TaskStatus::activeValues());
    }

    public function scopeHistory(Builder $query): Builder
    {
        return $query->whereIn('status', TaskStatus::historyValues());
    }

    public function isAssignedTo(User $user): bool
    {
        return $this->pic_id === $user->id
            || $this->members()->whereKey($user->id)->exists();
    }

    /**
     * @return array<int, int>
     */
    public function assigneeIds(): array
    {
        return collect([$this->pic_id])
            ->merge($this->members()->pluck('users.id'))
            ->filter()
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values()
            ->all();
    }

    /**
     * @return array{total: int, completed: int, percentage: int}
     */
    public function checklistProgress(): array
    {
        $checklists = $this->relationLoaded('checklists')
            ? $this->checklists
            : $this->checklists()->get();

        $total = $checklists->count();
        $completed = $checklists->where('is_completed', true)->count();

        return [
            'total' => $total,
            'completed' => $completed,
            'percentage' => $total === 0 ? 0 : (int) round(($completed / $total) * 100),
        ];
    }
}
