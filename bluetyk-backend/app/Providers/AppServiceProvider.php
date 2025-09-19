<?php

namespace App\Providers;

use App\Models\Settings;
use Illuminate\Support\ServiceProvider;

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

        // Fetch SMS setting from DB
        $smsEnabled = Settings::where('description', 'enable_sms')->value('value');

        // Convert string/number to boolean
        $smsEnabled = filter_var($smsEnabled, FILTER_VALIDATE_BOOLEAN);

        // Set it globally in config
        config(['app.sms_enabled' => $smsEnabled]);
    }
}
