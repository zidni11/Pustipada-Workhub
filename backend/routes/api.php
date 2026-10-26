<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DivisionController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\TaskStatusController;
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

Route::post('/auth/login', [AuthController::class, 'login'])
    ->middleware('throttle:10,1');

Route::middleware(['auth:sanctum', 'active'])->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::get('/user', fn (Request $request) => new UserResource(
        $request->user()->load('division'),
    ));

    Route::get('/divisions', [DivisionController::class, 'index']);

    Route::middleware('role:admin,pimpinan')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/{user}', [UserController::class, 'show']);
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
    });

    Route::middleware('role:pimpinan')->group(function () {
        Route::post('/tasks', [TaskController::class, 'store']);
        Route::match(['put', 'patch'], '/tasks/{task}', [TaskController::class, 'update']);
        Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);
    });
});
