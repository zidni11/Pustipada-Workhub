<?php

namespace App\Enums;

enum TaskStatus: string
{
    case DRAFT = 'draft';
    case OPEN = 'open';
    case IN_PROGRESS = 'in_progress';
    case IN_REVIEW = 'in_review';
    case REVISION_NEEDED = 'revision_needed';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * @return array<int, self>
     */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::DRAFT => [self::OPEN, self::CANCELLED],
            self::OPEN => [self::IN_PROGRESS, self::CANCELLED],
            self::IN_PROGRESS => [self::IN_REVIEW, self::CANCELLED],
            self::IN_REVIEW => [self::COMPLETED, self::REVISION_NEEDED, self::CANCELLED],
            self::REVISION_NEEDED => [self::IN_PROGRESS, self::CANCELLED],
            self::COMPLETED, self::CANCELLED => [],
        };
    }

    public function canTransitionTo(self $status): bool
    {
        return in_array($status, $this->allowedTransitions(), true);
    }

    public function isTerminal(): bool
    {
        return $this->allowedTransitions() === [];
    }

    public function label(): string
    {
        return match ($this) {
            self::DRAFT => 'Draft',
            self::OPEN => 'Open',
            self::IN_PROGRESS => 'In Progress',
            self::IN_REVIEW => 'In Review',
            self::REVISION_NEEDED => 'Revision Needed',
            self::COMPLETED => 'Completed',
            self::CANCELLED => 'Cancelled',
        };
    }
}
