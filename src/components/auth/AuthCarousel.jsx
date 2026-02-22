import React, { useState, useEffect } from 'react';

const slides = [
    {
        image: '/images/login-register/login-slider-1.png',
        title: 'Şehrin İlk Sosyal Etkinlik Ağı',
        description: "Masa'da yerini al, heyecanın, eğlencenin tadını çıkar",
    },
    {
        image: '/images/login-register/login-slider-2.png',
        title: 'Yakınındaki Deneyimleri Keşfet',
        description: 'Sana en yakın, en yeni etkinlikleri kolayca bul, dilediğine katıl',
    },
    {
        image: '/images/login-register/login-slider-3.png',
        title: 'Kendi Masanı Kur, Gelir Elde Et',
        description: 'Etkinliklerini düzenle, yönet, biletle, tanıt ve yeteneklerini gelire çevir',
    },
    {
        image: '/images/login-register/login-slider-4.png',
        title: 'Dilediğince İçinden Geldiği Gibi',
        description: 'Dilediğince masalara katıl, oluştur ve kazan.',
    },
];

export default function AuthCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full h-full flex flex-col justify-center items-center overflow-hidden bg-zinc-950 p-8 sm:p-12">


            {/* Logo on top left */}
            <div className="absolute top-8 left-8 z-20">
                <img src="/images/logo/logo-masa-white.svg" alt="Masa" className="h-[28px]" />
            </div>

            <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center">
                {/* Images array rendering for smooth fading */}
                <div className="relative w-full aspect-square mb-10 overflow-hidden rounded-2xl">
                    {slides.map((slide, index) => (
                        <img
                            key={index}
                            src={slide.image}
                            alt={slide.title}
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100 relative' : 'opacity-0 absolute'
                                }`}
                        />
                    ))}
                </div>

                {/* Texts container strictly sized to avoid jumps */}
                <div className="text-center min-h-[120px] flex flex-col items-center justify-start relative w-full">
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className={`transition-all duration-700 absolute w-full px-2 ${index === currentSlide
                                ? 'opacity-100 translate-y-0 relative'
                                : 'opacity-0 translate-y-4 absolute pointer-events-none'
                                }`}
                        >
                            <h2 className="text-[26px] font-bold mb-3 text-white tracking-tight leading-tight">{slide.title}</h2>
                            <p className="text-base text-zinc-400 leading-relaxed font-normal">{slide.description}</p>
                        </div>
                    ))}
                </div>

                {/* Indicators */}
                <div className="flex justify-center mt-8 space-x-2.5">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-2 rounded-full transition-all duration-500 ${index === currentSlide ? 'bg-white w-8' : 'bg-white/30 hover:bg-white/60 w-2'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
