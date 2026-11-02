<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CalendarController;
use App\Http\Controllers\Api\CommunityEventController;
use App\Http\Controllers\Api\DivisionController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\TaskChecklistController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\TaskStatusController;
use App\Http\Controllers\Api\TaskSubmissionController;
use App\Http\Controllers\Api\UserController;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    DB::select('SELECT 1');

    return response()->json([
        'status' => 'ok',
        'service' => 'Pustipada_Workhub',
        'database' => 'connected',
    ]);
});

Route::get('/divisions/public', [DivisionController::class, 'publicIndex']);

Route::post('/auth/register', [AuthController::class, 'register'])
    ->middleware('throttle:10,1');

Route::post('/auth/login', [AuthController::class, 'login'])
    ->middleware('throttle:10,1');

Route::middleware(['auth:sanctum', 'active'])->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::get('/user', fn (Request $request) => new UserResource(
        $request->user()->load('division'),
    ));

    Route::get('/divisions', [DivisionController::class, 'index']);

    Route::get('/events', [CommunityEventController::class, 'index']);
    Route::get('/calendar', CalendarController::class);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);

    Route::middleware('role:admin,pimpinan')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/{user}', [UserController::class, 'show']);

        Route::post('/events', [CommunityEventController::class, 'store']);
        Route::match(['put', 'patch'], '/events/{event}', [CommunityEventController::class, 'update']);
        Route::delete('/events/{event}', [CommunityEventController::class, 'destroy']);
    });

    Route::middleware('role:admin')->group(function () {
        Route::post('/users', [UserController::class, 'store']);
        Route::match(['put', 'patch'], '/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);

        Route::post('/divisions', [DivisionController::class, 'store']);
        Route::match(['put', 'patch'], '/divisions/{division}', [DivisionController::class, 'update']);
        Route::delete('/divisions/{division}', [DivisionController::class, 'destroy']);
    });

    Route::middleware('role:pimpinan,anggota')->group(function () {
        Route::get('/tasks', [TaskController::class, 'index']);
        Route::get('/tasks/{task}', [TaskController::class, 'show']);
        Route::patch('/tasks/{task}/status', TaskStatusController::class);

        Route::post('/tasks/{task}/submissions', [TaskSubmissionController::class, 'store']);
        Route::delete('/tasks/{task}/submissions/{submission}', [TaskSubmissionController::class, 'destroy']);

        Route::post('/tasks/{task}/checklists', [TaskChecklistController::class, 'store']);
        Route::patch('/tasks/{task}/checklists/{checklist}', [TaskChecklistController::class, 'toggle']);
        Route::delete('/tasks/{task}/checklists/{checklist}', [TaskChecklistController::class, 'destroy']);
    });

    Route::middleware('role:pimpinan')->group(function () {
        Route::post('/tasks', [TaskController::class, 'store']);
        Route::match(['put', 'patch'], '/tasks/{task}', [TaskController::class, 'update']);
        Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);
    });
});
