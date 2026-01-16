<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});
Route::get('/api-test-from-web', function () {
    return response()->json([
        'message' => 'This is from web.php',
        'api_url' => url('/api/test'),
        'current_time' => now()
    ]);
});
