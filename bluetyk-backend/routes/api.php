<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\User\UserController;
use App\Http\Controllers\Api\LoginController;
use App\Http\Controllers\Api\Members\MembersController;
use App\Http\Controllers\Api\Device\DeviceController;
use App\Http\Controllers\Api\Attandance\AttandaceController;
use App\Http\Controllers\Api\Dashboard\DashboardController;
use App\Http\Controllers\Api\Location\LocationController;
use App\Http\Controllers\Api\Department\DepartmentController;
use App\Http\Controllers\BiometricDeviceController;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');




UserController::Routes();
LoginController::Routes();
MembersController::Routes();
DeviceController::Routes();
AttandaceController::Routes();
DashboardController::Routes();
LocationController::Routes();
DepartmentController::Routes();
