<?php

namespace App\Enums;

enum NotificationType: string
{
    case TASK_ASSIGNED = 'task_assigned';
    case TASK_STATUS_CHANGED = 'task_status_changed';
    case EVENT_CREATED = 'event_created';
    case ACCOUNT_APPROVED = 'account_approved';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
