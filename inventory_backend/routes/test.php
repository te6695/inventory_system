<?php

use Illuminate\Support\Facades\Route;

Route::get('/test-route', function () {
    return response()->json(['message' => 'Test route works!']);
});