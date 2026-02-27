import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/forms/Input';
import Button from '../../components/common/Button';
import Link from '../../components/common/Link';
import { verificationService } from '../../services/authService';

const RESEND_COOLDOWN = 60; // seconds

export default function ResetPasswordByMobile() {
    const location = useLocation();
    const navigate = useNavigate();

    const email = location.state?.email;
    const initialCodeIndex = location.state?.codeIndex;
    const initialMobile = location.state?.mobile || null;
    const initialSecretCode = location.state?.secretCode || null;

    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [codeIndex, setCodeIndex] = useState(initialCodeIndex);
    const [mobile, setMobile] = useState(initialMobile);
    const [testCode, setTestCode] = useState(initialSecretCode);
    const [error, setError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
    const [canResend, setCanResend] = useState(false);
    const timerRef = useRef(null);

    // Redirect if no state
    useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    // Start countdown on mount
    useEffect(() => {
        startCountdown();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    const handleResend = async () => {
        setError('');
        setSuccessMessage('');
        try {
            const result = await verificationService.startPasswordResetByMobile(email);
            setCodeIndex(result.codeIndex);
            setMobile(result.mobile || null);
            setTestCode(result.secretCode || null);
            setSuccessMessage('Doğrulama kodu tekrar gönderildi. Lütfen telefonunuzu kontrol edin.');
            startCountdown();
        } catch (err) {
            const status = err.response?.status;
            if (status === 403) {
                setError('Çok sık istek gönderdiniz. Lütfen bekleyin.');
            } else {
                setError(err.response?.data?.message || 'Kod gönderilirken bir hata oluştu.');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setPasswordError('');

        if (password !== passwordConfirm) {
            setPasswordError('Şifreler eşleşmiyor. Lütfen kontrol edin.');
            return;
        }
        if (password.length < 6) {
            setPasswordError('Şifre en az 6 karakter olmalıdır.');
            return;
        }

        setLoading(true);
        try {
            const result = await verificationService.completePasswordResetByMobile(email, code, password);
            if (result.isVerified) {
                navigate('/login', {
                    state: { successMessage: 'Şifreniz başarıyla sıfırlandı. Yeni şifrenizle giriş yapabilirsiniz.' },
                });
            } else {
                setError('Şifre sıfırlama başarısız oldu. Lütfen tekrar deneyin.');
            }
        } catch (err) {
            const status = err.response?.status;
            if (status === 403) {
                setError('Doğrulama kodu hatalı veya süresi dolmuş. Lütfen tekrar deneyin.');
            } else {
                setError(err.response?.data?.message || 'Şifre sıfırlanırken bir hata oluştu.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="w-full">
                <h1 className="text-3xl font-bold text-zinc-900 mb-2 mt-4 tracking-tight">
                    Şifre Sıfırlama
                </h1>
                <p className="text-zinc-500 mb-6 text-[15px]">
                    {mobile
                        ? <>Telefon numaranıza (<strong>{mobile}</strong>) gönderilen 6 haneli kodu ve yeni şifrenizi girin.</>
                        : <><strong>{email}</strong> adresinize bağlı telefona gönderilen 6 haneli kodu ve yeni şifrenizi girin.</>
                    }
                </p>

                {/* Code Index Info */}
                {codeIndex !== undefined && codeIndex !== null && (
                    <div className="mb-5 flex items-start gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-200 text-[13px] text-zinc-600">
                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                            SMS'nizdeki mesajda kod indeksi{' '}
                            <strong className="text-zinc-800 font-semibold">#{codeIndex}</strong>{' '}
                            olarak görünmelidir. Lütfen eşleştiğinden emin olun.
                        </span>
                    </div>
                )}

                {/* Test Mode: Show Secret Code */}
                {testCode && (
                    <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <p className="text-[12px] font-semibold text-amber-700 uppercase tracking-wide mb-1">
                            🧪 Test Modu — Geliştirici Kodu
                        </p>
                        <p className="text-[13px] text-amber-600 mb-2">
                            Bu kod yalnızca geliştirme ortamında görünür:
                        </p>
                        <div className="flex items-center gap-2">
                            <code className="text-xl font-bold tracking-[0.35em] text-amber-800 bg-amber-100 px-3 py-1.5 rounded-lg">
                                {testCode}
                            </code>
                            <button
                                type="button"
                                onClick={() => setCode(testCode)}
                                className="text-[12px] text-amber-700 underline hover:no-underline font-medium px-2 py-1 rounded hover:bg-amber-100 transition-colors"
                            >
                                Kopyala &amp; Yapıştır
                            </button>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mb-5 p-4 bg-red-50 text-red-600 rounded-xl text-[14px] font-medium border border-red-100/50 leading-relaxed shadow-sm">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="mb-5 p-4 bg-green-50 text-green-600 rounded-xl text-[14px] font-medium border border-green-100/50 leading-relaxed shadow-sm">
                        {successMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        id="reset-code"
                        label="Doğrulama Kodu"
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="6 haneli kodu girin"
                        required
                        maxLength={6}
                    />

                    <div className="pt-1">
                        <div className="border-t border-zinc-100 pt-4">
                            <p className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                                Yeni Şifre
                            </p>
                        </div>

                        {passwordError && (
                            <div className="mb-3 p-3 bg-red-50 text-red-600 rounded-lg text-[13px] font-medium border border-red-100/50">
                                {passwordError}
                            </div>
                        )}

                        <div className="space-y-3">
                            <Input
                                id="new-password"
                                label="Yeni Şifre"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="En az 6 karakter"
                                required
                            />
                            <Input
                                id="confirm-password"
                                label="Yeni Şifre (Tekrar)"
                                type="password"
                                value={passwordConfirm}
                                onChange={(e) => setPasswordConfirm(e.target.value)}
                                placeholder="Şifrenizi tekrar girin"
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading || !code || code.length < 6 || !password || !passwordConfirm}
                        className="w-full mt-2 h-[52px] !rounded-xl"
                    >
                        {loading ? 'Şifre Sıfırlanıyor...' : 'Şifremi Sıfırla'}
                    </Button>
                </form>

                <div className="mt-6 text-center space-y-2">
                    <p className="text-[14px] text-zinc-600">
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
                    <p className="text-[14px] text-zinc-500">
                        <Link to="/forgot-password">
                            ← Geri Dön
                        </Link>
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
}
