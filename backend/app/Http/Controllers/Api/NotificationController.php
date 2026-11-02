<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserNotificationResource;
use App\Models\UserNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class NotificationController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        return UserNotificationResource::collection(
            $user->userNotifications()->limit(30)->get(),
        )->additional([
            'unread_count' => $user->userNotifications()->unread()->count(),
        ]);
    }

    public function markRead(Request $request, UserNotification $notification): UserNotificationResource
    {
        abort_unless($notification->user_id === $request->user()->id, 403);

        $notification->markAsRead();

        return new UserNotificationResource($notification->refresh());
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $updated = $request->user()
            ->userNotifications()
            ->unread()
            ->update(['read_at' => now()]);

        return response()->json([
            'message' => 'Semua notifikasi ditandai sudah dibaca.',
            'updated' => $updated,
            'unread_count' => 0,
        ]);
    }
}
