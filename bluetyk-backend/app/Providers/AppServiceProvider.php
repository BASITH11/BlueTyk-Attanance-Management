<?php

namespace App\Providers;

use App\Models\Settings;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;


class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {

        if (Schema::hasTable('settings')) {
            $smsEnabled = Settings::where('description', 'enable_sms')->value('value');
            $smsEnabled = filter_var($smsEnabled, FILTER_VALIDATE_BOOLEAN);
            config(['app.sms_enabled' => $smsEnabled]);

            $timeZone = Settings::where('description', 'time_zone')->value('value') ?? config('app.timezone');
            config(['app.timezone' => $timeZone]);
            date_default_timezone_set($timeZone);
        }
    }
}
