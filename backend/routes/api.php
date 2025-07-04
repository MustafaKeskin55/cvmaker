<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HeroSectionController;
// Diğer kontrolörleri buraya ekleyin

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Kullanıcı kimlik doğrulama rotaları
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Public API rotaları
Route::prefix('v1')->group(function () {
    // Hero Section rotaları
    Route::get('/hero-section', [HeroSectionController::class, 'index']);
    
    // Admin için güvenlik katmanı gerektiren rotalar
    Route::middleware(['auth:sanctum', 'admin'])->group(function () {
        // Hero Section güncelleme
        Route::post('/hero-section', [HeroSectionController::class, 'store']);
    });
    
    // Özellikler bölümü rotaları
    // Route::get('/features', [FeaturesController::class, 'index']);
    
    // Hizmetler bölümü rotaları
    // Route::get('/services', [ServicesController::class, 'index']);
    
    // Ana sayfa için tüm veriler
    Route::get('/home', function () {
        return response()->json([
            'heroSection' => app()->make(HeroSectionController::class)->index()->original,
            // 'featuresSection' => app()->make(FeaturesController::class)->index()->original,
            // 'servicesSection' => app()->make(ServicesController::class)->index()->original,
            // 'testimonialsSection' => app()->make(TestimonialsController::class)->index()->original,
            // 'contactSection' => app()->make(ContactController::class)->index()->original,
        ]);
    });
    
    // İletişim form gönderimi
    // Route::post('/contact', [ContactController::class, 'store']);
}); 