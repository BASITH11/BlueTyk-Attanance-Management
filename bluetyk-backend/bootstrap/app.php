<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\CheckUserType;
use App\Http\Middleware\CheckDevice;
use App\Http\Middleware\CheckSubscription;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
        $middleware->validateCsrfTokens(except: [
            'iclock/cdata.aspx',
            'iclock/devicecmd.aspx',
        ]);
        $middleware->alias([
            'check.user' => CheckUserType::class,
            'check.device' => CheckDevice::class,
            'check.subscription' => CheckSubscription::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
