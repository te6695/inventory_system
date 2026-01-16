<?php

namespace App\Providers;

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
        // In Laravel 11, routing and rate limiting is configured in bootstrap/app.php
        // Remove the configureRateLimiting() call
        // Remove the routes() closure
        
        // If you need to add any bootstrapping code, put it here
        // But not routing or rate limiting
    }
}