<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/health', function () {
    DB::select('SELECT 1');

    return response()->json([
        'status' => 'ok',
        'service' => 'Pustipada_Workhub',
        'database' => 'connected',
    ]);
});
