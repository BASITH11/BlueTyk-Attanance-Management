<?php

// $requestUrl = $_SERVER['REQUEST_METHOD'] . ' ' . $_SERVER['REQUEST_URI'];
// $logPath = __DIR__ . '/request_log.txt';

// file_put_contents($logPath, '[' . date('Y-m-d H:i:s') . '] ' . $requestUrl . PHP_EOL, FILE_APPEND);

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));


// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());
