import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { loginCarouselSlideService } from '../../services/masaSettingsService';
import MasaSpinner from '../common/MasaSpinner';

const FALLBACK_SLIDES = [
    {
        url: '/images/login-register/login-slider-1.png',
        slogan: 'Şehrin İlk Sosyal Etkinlik Ağı',
        subSlogan: "Masa'da yerini al, heyecanın, eğlencenin tadını çıkar",
    },
    {
        url: '/images/login-register/login-slider-2.png',
        slogan: 'Yakınındaki Deneyimleri Keşfet',
        subSlogan: 'Sana en yakın, en yeni etkinlikleri kolayca bul, dilediğine katıl',
    },
    {
        url: '/images/login-register/login-slider-3.png',
        slogan: 'Kendi Masanı Kur, Gelir Elde Et',
        subSlogan: 'Etkinliklerini düzenle, yönet, biletle, tanıt ve yeteneklerini gelire çevir',
    },
    {
        url: '/images/login-register/login-slider-4.png',
        slogan: 'Dilediğince İçinden Geldiği Gibi',
        subSlogan: 'Dilediğince masalara katıl, oluştur ve kazan.',
    },
];

export default function AuthCarousel() {
    const [slides, setSlides] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [ready, setReady] = useState(false);

    // Fetch slides from API, fall back to static data if unavailable
    useEffect(() => {
        loginCarouselSlideService.list()
            .then((data) => {
                const apiSlides = data?.loginCarouselSlides || [];
                const sorted = [...apiSlides].sort((a, b) => a.sortOrder - b.sortOrder);
                setSlides(sorted.length > 0 ? sorted : FALLBACK_SLIDES);
            })
            .catch(() => {
                setSlides(FALLBACK_SLIDES);
            })
            .finally(() => {
                setReady(true);
            });
    }, []);

    // Auto-advance timer — restart when slides change
    useEffect(() => {
        if (slides.length === 0) return;
        setCurrentSlide(0);
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides]);

    return (
        <div className="relative w-full h-full flex flex-col justify-center items-center overflow-hidden bg-zinc-950 p-8 sm:p-12">

            {/* Logo on top left */}
            <Link to="/" className="absolute top-8 left-8 z-20">
                <img src="/images/logo/logo-masa-white.svg" alt="Masa" className="h-[28px]" />
            </Link>

            <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center">

                {/* Loading state — MasaSpinner (light variant for dark bg) */}
                {!ready ? (
                    <div className="flex items-center justify-center w-full" style={{ minHeight: 340 }}>
                        <MasaSpinner size={96} light />
                    </div>
                ) : (
                    <>
                        {/* Slide images */}
                        <div className="relative w-full aspect-square mb-10 overflow-hidden rounded-2xl">
                            {slides.map((slide, index) => (
                                <img
                                    key={slide.id ?? index}
                                    src={slide.url}
                                    alt={slide.slogan}
                                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Text content */}
                        <div className="text-center min-h-[120px] flex flex-col items-center justify-start relative w-full">
                            {slides.map((slide, index) => (
                                <div
                                    key={slide.id ?? index}
                                    className={`transition-all duration-700 absolute w-full px-2 ${index === currentSlide
                                        ? 'opacity-100 translate-y-0'
                                        : 'opacity-0 translate-y-4 pointer-events-none'
                                        }`}
                                >
                                    <h2 className="text-[26px] font-bold mb-3 text-white tracking-tight leading-tight">
                                        {slide.slogan}
                                    </h2>
                                    {slide.subSlogan && (
                                        <p className="text-base text-zinc-400 leading-relaxed font-normal">
                                            {slide.subSlogan}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Dot indicators */}
                        <div className="flex justify-center mt-8 space-x-2.5">
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`h-2 rounded-full transition-all duration-500 ${index === currentSlide
                                        ? 'bg-white w-8'
                                        : 'bg-white/30 hover:bg-white/60 w-2'
                                        }`}
                                    aria-label={`Slayt ${index + 1}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
