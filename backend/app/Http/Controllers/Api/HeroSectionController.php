<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HeroSection;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class HeroSectionController extends Controller
{
    /**
     * Hero section verilerini getir.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $heroSection = HeroSection::first();
        
        if (!$heroSection) {
            return response()->json([
                'title' => 'Acil Destek Lazım',
                'subtitle' => 'İhtiyacınız olan profesyonel çözümler burada',
                'buttonText' => 'Hizmetlerimiz',
                'buttonLink' => '/hizmetlerimiz',
                'backgroundImage' => '/assets/images/hero-bg.jpg'
            ], Response::HTTP_OK);
        }
        
        return response()->json($heroSection, Response::HTTP_OK);
    }

    /**
     * Hero section verilerini kaydet.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'required|string',
            'buttonText' => 'required|string|max:50',
            'buttonLink' => 'required|string|max:255',
            'backgroundImage' => 'nullable|string|max:255'
        ]);

        $heroSection = HeroSection::first();
        
        if ($heroSection) {
            $heroSection->update($validatedData);
        } else {
            $heroSection = HeroSection::create($validatedData);
        }

        return response()->json($heroSection, Response::HTTP_OK);
    }
} 