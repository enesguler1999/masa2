import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/forms/Input';
import Button from '../../components/common/Button';
import { verificationService } from '../../services/authService';

const RESEND_COOLDOWN = 60; // seconds

export default function VerifyMobile() {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
    const [canResend, setCanResend] = useState(false);
    const [startLoading, setStartLoading] = useState(true);
    const timerRef = useRef(null);
    const hasSent = useRef(false);

    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;

    const startCountdown = () => {
        setCountdown(RESEND_COOLDOWN);
        setCanResend(false);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    useEffect(() => {
        if (!email) {
            navigate('/login');
            return;
        }
        // Start verification on mount
        if (!hasSent.current) {
            hasSent.current = true;
            (async () => {
                try {
                    await verificationService.startMobileVerification(email);
                    setSuccessMessage('Doğrulama kodu telefonunuza gönderildi.');
                    startCountdown();
                } catch (err) {
                    setError(err.response?.data?.message || 'Kod gönderilirken bir hata oluştu.');
                } finally {
                    setStartLoading(false);
                }
            })();
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await verificationService.completeMobileVerification(email, code);
            if (result.isVerified) {
                navigate('/login', { state: { successMessage: 'Telefon numaranız başarıyla doğrulandı. Lütfen giriş yapın.' } });
            } else {
                setError('Doğrulama başarısız oldu.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Geçersiz doğrulama kodu.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError('');
        setSuccessMessage('');
        try {
            await verificationService.startMobileVerification(email);
            setSuccessMessage('Doğrulama kodu tekrar gönderildi.');
            startCountdown();
        } catch (err) {
            setError(err.response?.data?.message || 'Kod gönderilirken bir hata oluştu.');
        }
    };

    return (
        <AuthLayout>
            <div className="w-full">
                <h1 className="text-3xl font-bold text-zinc-900 mb-2 mt-4 tracking-tight">Telefon Doğrulaması</h1>
                <p className="text-zinc-500 mb-8 text-[15px]">
                    Lütfen {email} adresinize bağlı telefon numarasına gönderilen 6 haneli kodu girin.
                </p>

                {startLoading && (
                    <div className="mb-6 p-4 bg-zinc-100 text-zinc-600 rounded-xl text-[14px] font-medium border border-zinc-200 leading-relaxed flex items-center gap-3">
                        <svg className="animate-spin h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Doğrulama kodu gönderiliyor...
                    </div>
                )}

                {error && !startLoading && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-[14px] font-medium border border-red-100/50 leading-relaxed shadow-sm">
                        {error}
                    </div>
                )}

                {successMessage && !startLoading && (
                    <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-xl text-[14px] font-medium border border-green-100/50 leading-relaxed shadow-sm">
                        {successMessage}
                    </div>
                )}

                <form onSubmit={handleVerify} className="space-y-4">
                    <Input
                        id="code"
                        label="Doğrulama Kodu"
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Örn: 123456"
                        required
                        maxLength={6}
                    />

                    <Button
                        type="submit"
                        disabled={loading || !code || code.length < 6}
                        className="w-full mt-4 h-[52px] !rounded-xl"
                    >
                        {loading ? 'Doğrulanıyor...' : 'Doğrula'}
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-[15px] text-zinc-600">
                        Kodu almadınız mı?{' '}
                        {canResend ? (
                            <button
                                type="button"
                                onClick={handleResend}
                                className="text-zinc-900 font-medium hover:underline transition-opacity"
                            >
                                Tekrar Gönder
                            </button>
                        ) : (
                            <span className="text-zinc-400 font-medium">
                                Tekrar Gönder ({countdown}s)
                            </span>
                        )}
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
}
