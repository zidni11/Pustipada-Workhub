<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'service' => 'PUSTIPADA WorkHub REST API',
        'version' => '1.0.0',
        'status' => 'online',
        'frontend_url' => env('FRONTEND_URL', 'http://localhost:5173'),
        'timestamp' => now()->toIso8601String(),
    ]);
});
