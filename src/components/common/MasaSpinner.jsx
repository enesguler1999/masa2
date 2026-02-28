import React from 'react';

/**
 * MasaSpinner — Logo şekli + sıralı animasyon.
 *
 * Her yarım daire sırayla (üst→sağ→alt→sol):
 *   1. Logo merkezi etrafında ~32° döner
 *   2. Yavaşça kaybolur (opacity → 0)
 *   3. Başlangıç konumuna snap'ler (görünmez)
 *   4. Yavaşça geri belirir
 *
 * @param {number} size  – px. Default: 96
 * @param {string} color – Default: '#ffffff'
 */
export default function MasaSpinner({ size = 96, color = '#ffffff' }) {
    const BASE = 39.1;
    const s = (v) => v * (size / BASE);

    // Logo container merkezi (base koordinatında)
    const CX = BASE / 2;   // ≈ 19.55
    const CY = BASE / 2;   // ≈ 19.56

    /**
     * Her yarım daire için transform-origin'i logo merkezine göre hesaplıyoruz.
     * element konumu (elLeft, elTop) → origin = (CX - elLeft, CY - elTop)
     */
    const halves = [
        {
            id: 'top',
            width: s(17.02),
            height: s(8.56),
            left: s(11.05),
            top: s(0),
            radius: `${s(8.51)}px ${s(8.51)}px 0 0`,
            // origin px → logo merkezine göre (scale'lenmiş)
            originX: s(CX - 11.05),   // s(8.50)
            originY: s(CY - 0),        // s(19.56)
            delay: '0s',
        },
        {
            id: 'right',
            width: s(8.53),
            height: s(17.03),
            left: s(30.57),
            top: s(11.05),
            radius: `0 ${s(8.51)}px ${s(8.51)}px 0`,
            originX: s(CX - 30.57),   // s(-11.02)
            originY: s(CY - 11.05),   // s(8.51)
            delay: '1s',
        },
        {
            id: 'bottom',
            width: s(17.01),
            height: s(8.55),
            left: s(11.05),
            top: s(30.57),
            radius: `0 0 ${s(8.50)}px ${s(8.50)}px`,
            originX: s(CX - 11.05),   // s(8.50)
            originY: s(CY - 30.57),   // s(-11.01)
            delay: '2s',
        },
        {
            id: 'left',
            width: s(8.55),
            height: s(17.04),
            left: s(0),
            top: s(11.03),
            radius: `${s(8.52)}px 0 0 ${s(8.52)}px`,
            originX: s(CX - 0),        // s(19.55)
            originY: s(CY - 11.03),   // s(8.53)
            delay: '3s',
        },
    ];

    const DURATION = '4s';  // toplam döngü süresi

    return (
        <>
            <style>{`
                /*
                 * Her yarım daire cycle'ın ilk %25'inde hareket eder, kalan %75'te durur.
                 * 4 parça × 0.65s = 2.6s toplam döngü.
                 *
                 * 0%    → rotate(0deg)   : başlangıç konumu
                 * 12.5% → rotate(32deg)  : tepe nokta (gidiş)
                 * 25%   → rotate(0deg)   : geri döndü
                 * 100%  → rotate(0deg)   : diğerleri hareket ederken bekle
                 */
                @keyframes masaHalfPulse {
                    0%     { transform: rotate(0deg);   opacity: 1; }
                    12.5%  { transform: rotate(10deg);  opacity: 0; }
                    12.51% { transform: rotate(0deg);   opacity: 0; }
                    25%    { transform: rotate(0deg);   opacity: 1; }
                    100%   { transform: rotate(0deg);   opacity: 1; }
                }
            `}</style>

            <div style={{
                position: 'relative',
                width: s(39.10),
                height: s(39.12),
                flexShrink: 0,
            }}>
                {/* Merkez daire — static */}
                <div style={{
                    position: 'absolute',
                    width: s(21),
                    height: s(21.02),
                    left: s(9.04),
                    top: s(9.05),
                    borderRadius: '50%',
                    backgroundColor: color,
                }} />

                {/* Yarım daireler */}
                {halves.map((h) => (
                    <div
                        key={h.id}
                        style={{
                            position: 'absolute',
                            width: h.width,
                            height: h.height,
                            left: h.left,
                            top: h.top,
                            borderRadius: h.radius,
                            backgroundColor: color,
                            // transform-origin: logo merkezine göre
                            transformOrigin: `${h.originX}px ${h.originY}px`,
                            animation: `masaHalfPulse ${DURATION} ease-in-out infinite`,
                            animationDelay: h.delay,
                            animationFillMode: 'both',
                        }}
                    />
                ))}
            </div>
        </>
    );
}
