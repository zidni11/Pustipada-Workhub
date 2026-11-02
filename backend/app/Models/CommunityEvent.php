<?php

namespace App\Models;

use App\Enums\CommunityEventCategory;
use App\Enums\UserRole;
use Database\Factories\CommunityEventFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'title',
    'description',
    'category',
    'location',
    'start_at',
    'end_at',
    'division_id',
    'created_by',
])]
class CommunityEvent extends Model
{
    /** @use HasFactory<CommunityEventFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'category' => CommunityEventCategory::class,
            'start_at' => 'datetime',
            'end_at' => 'datetime',
        ];
    }

    public function division(): BelongsTo
    {
        return $this->belongsTo(Division::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        if (in_array($user->role, [UserRole::ADMIN, UserRole::PIMPINAN], true)) {
            return $query;
        }

        return $query->where(function (Builder $query) use ($user) {
            $query->whereNull('division_id');

            if ($user->division_id !== null) {
                $query->orWhere('division_id', $user->division_id);
            }
        });
    }
}
