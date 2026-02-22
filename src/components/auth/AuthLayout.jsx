import React from 'react';
import AuthCarousel from './AuthCarousel';

export default function AuthLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-white">
            {/* Background Pattern with 10% opacity */}

            {/* Left side: Dark with Carousel */}
            <div className="hidden lg:flex lg:w-[45%] xl:w-[45%] bg-zinc-950 relative flex-col">
                <AuthCarousel />
            </div>

            {/* Right side: Light, Auth Form */}
            <div className="w-full lg:w-[55%] xl:w-[55%] flex flex-col justify-center items-center p-6 sm:p-12 relative bg-zinc-50 overflow-y-auto">
                <div className="w-full max-w-[440px]">
                    {/* Show logo on top for mobile only since desktop has it on the left */}
                    <div className="lg:hidden flex justify-start mb-8">
                        <img src="/images/logo/logo-masa.svg" alt="Masa" className="h-8" />
                    </div>

                    {children}
                </div>
            </div>
            <div
                className="absolute inset-0 z-0 opacity-5 pointer-events-none mix-blend-screen"
                style={{
                    backgroundImage: 'url(/images/bg-pattern.svg)',
                    backgroundRepeat: 'repeat',
                }}
            />
        </div>
    );
}
