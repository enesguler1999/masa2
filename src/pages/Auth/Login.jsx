import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../../components/common/Button';
import Link from '../../components/common/Link';
import AuthLayout from '../../components/auth/AuthLayout';
import { authService } from '../../services/authService';
import Input from '../../components/forms/Input';
import { useUser } from '../../context/UserContext';
import { resolveApiError, isValidEmail } from '../../utils/formValidation';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { refreshUser } = useUser();
    const navigate = useNavigate();
    const location = useLocation();
    const locationSuccessMessage = location.state?.successMessage || '';

    const clearErrors = () => setFieldErrors({});
    const setFieldError = (field, msg) =>
        setFieldErrors((prev) => ({ ...prev, [field]: msg }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearErrors();

        // ─── Client-side validation ───────────────────────────────────────────
        let hasError = false;
        if (!email.trim()) {
            setFieldError('email', 'E-posta adresi boş bırakılamaz.');
            hasError = true;
        } else if (!isValidEmail(email)) {
            setFieldError('email', 'Geçerli bir e-posta adresi girin.');
            hasError = true;
        }
        if (!password) {
            setFieldError('password', 'Şifre boş bırakılamaz.');
            hasError = true;
        }
        if (hasError) return;

        setLoading(true);
        try {
            const result = await authService.login({
                username: email,
                password: password,
            });

            if (result.accessToken) {
                await refreshUser();
                navigate('/');
            }
        } catch (err) {
            const errCode = err.response?.data?.errCode;
            const fallback = err.response?.data?.message;

            if (errCode === 'EmailVerificationNeeded') {
                navigate('/verify-email', { state: { email } });
            } else if (errCode === 'MobileVerificationNeeded') {
                navigate('/verify-mobile', { state: { email } });
            } else {
                const { field, message } = resolveApiError(errCode, fallback || 'Giriş başarısız oldu.');
                // Login sayfasında _generic hataları da password altında göster
                setFieldError(field === '_generic' ? 'password' : field, message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        authService.initiateSocialLogin('google');
    };

    return (
        <AuthLayout>
            <div className="w-full">
                <h1 className="text-3xl font-extrabold text-zinc-900 mb-2 mt-4 tracking-tight">Giriş Yap</h1>
                <p className="text-zinc-900 mb-8 text-[15px]">Masa'ya giriş yapın ve etrafınızdaki etkinlikleri keşfetmeye kaldığınız yerden devam edin.</p>

                {/* Başarı mesajı (örn. kayıt sonrası yönlendirme) */}
                {locationSuccessMessage && (
                    <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-xl text-[14px] font-medium border border-green-100/50 leading-relaxed shadow-sm">
                        {locationSuccessMessage}
                    </div>
                )}

                {/* Genel hata (belirli bir alana bağlanamayan) */}
                {fieldErrors._generic && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-[14px] font-medium border border-red-100/50 leading-relaxed shadow-sm">
                        {fieldErrors._generic}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setFieldError('email', ''); }}
                        placeholder="E-posta adresinizi girin"
                        error={fieldErrors.email}
                    />

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <Link to="/forgot-password" className="text-[13px] font-medium ml-auto">
                                Şifremi unuttum
                            </Link>
                        </div>
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setFieldError('password', ''); }}
                            placeholder="••••••••"
                            error={fieldErrors.password}
                            suffix={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="text-zinc-400 hover:text-zinc-700 transition-colors focus:outline-none"
                                    tabIndex={-1}
                                    aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            }
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 h-[52px] !rounded-full"
                    >
                        {loading ? 'Giriş yapılıyor...' : 'GİRİŞ YAP'}
                    </Button>
                </form>

                <div className="mt-8 relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 text-[13px] font-medium bg-zinc-50 text-zinc-500 uppercase tracking-widest">
                            veya
                        </span>
                    </div>
                </div>

                <div className="mt-8">
                    <Button
                        onClick={handleGoogleLogin}
                        type="button"
                        variant="secondary"
                        className="w-full h-[52px] !rounded-full flex items-center justify-center space-x-2.5"
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-[18px] h-[18px]" />
                        <span className="text-[15px]">Google ile Giriş Yap</span>
                    </Button>
                </div>

                <p className="mt-10 text-center text-[15px] text-zinc-600">
                    Hesabınız yok mu?{' '}
                    <Link to="/register" variant="secondary">
                        Kayıt Ol
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
