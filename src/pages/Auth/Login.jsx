import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../../components/common/Button';
import Link from '../../components/common/Link';
import AuthLayout from '../../components/auth/AuthLayout';
import { authService } from '../../services/authService';
import Input from '../../components/forms/Input';
import { useUser } from '../../context/UserContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { refreshUser } = useUser();
    const navigate = useNavigate();
    const location = useLocation();
    const locationSuccessMessage = location.state?.successMessage || '';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await authService.login({
                username: email,
                password: password,
            });

            if (result.accessToken) {
                await refreshUser(); // Sync context so Header updates immediately
                navigate('/');
            }
        } catch (err) {
            if (err.response?.data?.errCode) {
                const errCode = err.response.data.errCode;
                if (errCode === 'EmailVerificationNeeded') {
                    navigate('/verify-email', { state: { email } });
                } else if (errCode === 'MobileVerificationNeeded') {
                    navigate('/verify-mobile', { state: { email } });
                } else {
                    setError(err.response.data.message || 'Giriş başarısız oldu.');
                }
            } else {
                setError('Giriş yapılırken beklenmedik bir hata oluştu.');
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
                <h1 className="text-3xl font-bold text-zinc-900 mb-2 mt-4 tracking-tight">Tekrar Hoş Geldiniz</h1>
                <p className="text-zinc-500 mb-8 text-[15px]">Masa'ya giriş yapın ve etrafınızdaki etkinlikleri keşfetmeye kaldığınız yerden devam edin.</p>

                {locationSuccessMessage && (
                    <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-xl text-[14px] font-medium border border-green-100/50 leading-relaxed shadow-sm">
                        {locationSuccessMessage}
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-[14px] font-medium border border-red-100/50 leading-relaxed shadow-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        id="email"
                        label="E-posta"
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="E-posta adresinizi girin"
                        required
                    />

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-[14px] font-medium text-zinc-700 ml-1" htmlFor="password">
                                Şifre
                            </label>
                            <Link to="/forgot-password" className="text-[13px] font-medium">
                                Şifremi unuttum
                            </Link>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 h-[52px] !rounded-xl"
                    >
                        {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
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
                        className="w-full h-[52px] !rounded-xl flex items-center justify-center space-x-2.5"
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-[18px] h-[18px]" />
                        <span className="text-[15px]">Google ile Devam Et</span>
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
