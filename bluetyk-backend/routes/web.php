<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BiometricDeviceController;

Route::get('/', function () {
    return view('welcome');
});

BiometricDeviceController::Routes();

