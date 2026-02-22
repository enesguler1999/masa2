import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../../components/common/Button';
import Link from '../../components/common/Link';
import AuthLayout from '../../components/auth/AuthLayout';
import { authService } from '../../services/authService';
import Input from '../../components/forms/Input';

export default function Register() {
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mobile, setMobile] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // This helps to grab socialCode or email from the URL if user navigated from social callback
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const socialKey = searchParams.get('social');
    const isSocial = socialKey === 'true';

    const navigate = useNavigate();

    // If component is loaded with social registration flow
    useEffect(() => {
        if (isSocial) {
            // Typically, one would use session storage or context that holds the temporary accountInfo and socialCode
            const storedAccountInfo = JSON.parse(sessionStorage.getItem('socialAccountInfo') || '{}');
            const storedSocialCode = sessionStorage.getItem('socialCode');

            if (storedSocialCode) {
                if (storedAccountInfo.email) setEmail(storedAccountInfo.email);
                if (storedAccountInfo.fullname) setFullname(storedAccountInfo.fullname);
            }
        }
    }, [isSocial]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const payload = {
                fullname,
                email,
                password,
                mobile,
                isPublic: true,
            };

            if (isSocial) {
                payload.socialCode = sessionStorage.getItem('socialCode');
            }

            const result = await authService.registerUser(payload);

            // Auto login check if token is returned
            if (result.accessToken) {
                localStorage.setItem('accessToken', result.accessToken);
                // Clear session storage just in case we were in social reg flow
                sessionStorage.removeItem('socialAccountInfo');
                sessionStorage.removeItem('socialCode');
                navigate('/');
            }
            // If email verification needed
            else if (result.emailVerificationNeeded) {
                navigate('/verify-email', { state: { email } });
            }
            // Default: Auto navigate to mobile verify
            else {
                navigate('/verify-mobile', { state: { email } });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Hesap oluşturulurken beklenmedik bir hata oluştu.');
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
                <h1 className="text-3xl font-bold text-zinc-900 mb-2 mt-4 tracking-tight">Kayıt Ol</h1>
                <p className="text-zinc-500 mb-8 text-[15px]">Masa'ya katılın ve yakınınızdaki yeni deneyimleri keşfetmeye hemen başlayın.</p>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-[14px] font-medium border border-red-100/50 leading-relaxed shadow-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        id="fullname"
                        label="Ad Soyad"
                        type="text"
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                        placeholder="Adınızı ve soyadınızı girin"
                        required
                    />

                    <Input
                        id="email"
                        label="E-posta"
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={isSocial ? 'bg-zinc-100 text-zinc-500 cursor-not-allowed' : ''}
                        placeholder="E-posta adresinizi girin"
                        required
                        readOnly={isSocial}
                    />

                    <Input
                        id="mobile"
                        label="Telefon Numarası"
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="+905554443322"
                        required
                    />

                    <Input
                        id="password"
                        label="Şifre"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                    />

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-4 h-[52px] !rounded-xl"
                    >
                        {loading ? 'Kayıt olunuyor...' : 'Hesap Oluştur'}
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
                    Zaten bir hesabınız var mı?{' '}
                    <Link to="/login" variant="secondary">
                        Giriş Yap
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
