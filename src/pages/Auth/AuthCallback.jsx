import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/authService';

export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [errorMsg, setErrorMsg] = useState(null);
    const calledRef = useRef(false);

    useEffect(() => {
        if (calledRef.current) return;
        calledRef.current = true;

        const provider = searchParams.get('provider');
        const socialCode = searchParams.get('socialCode');
        const error = searchParams.get('error');

        const processCallback = async () => {
            if (error) {
                try {
                    const base64 = error.replace(/-/g, '+').replace(/_/g, '/');
                    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
                    const decoded = new TextDecoder().decode(bytes);
                    const errorData = JSON.parse(decoded);
                    setErrorMsg(errorData.message || 'Sosyal giriş başarısız oldu.');
                } catch (e) {
                    setErrorMsg('Bilinmeyen bir hata oluştu. Lütfen tekrar deneyin.');
                }
                return;
            }

            if (socialCode) {
                try {
                    const data = await authService.getSocialLoginResult(socialCode);

                    if (data.result === 'ERR' || data.errCode) {
                        setErrorMsg(data.message || 'Giriş işlemi başarısız oldu.');
                        return;
                    }

                    if (data.type === 'RegisterNeededForSocialLogin') {
                        // Registration needed
                        sessionStorage.setItem('socialAccountInfo', JSON.stringify(data.accountInfo || {}));
                        sessionStorage.setItem('socialCode', data.socialCode || socialCode);
                        navigate('/register?social=true');
                        return;
                    }

                    if (data.accessToken) {
                        // Login successful (token is stored inside authService.getSocialLoginResult)
                        navigate('/');
                        return;
                    }

                    // Fallback
                    setErrorMsg('Beklenmeyen bir yanıt alındı.');
                } catch (err) {
                    setErrorMsg(err.response?.data?.message || 'İletişim sırasında bir hata oluştu.');
                }
            } else {
                setErrorMsg('Gerekli parametreler eksik. Lütfen tekrar deneyin.');
            }
        };

        processCallback();
    }, [searchParams, navigate]);

    if (errorMsg) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50">
                <div className="p-8 bg-white rounded-xl shadow-sm border border-zinc-200 text-center max-w-md w-full">
                    <h2 className="text-xl font-semibold text-red-600 mb-4">Giriş Başarısız</h2>
                    <p className="text-zinc-600 mb-6">{errorMsg}</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full h-[52px] bg-zinc-900 text-white rounded-xl font-medium transition-colors hover:bg-zinc-800"
                    >
                        Giriş Sayfasına Dön
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50">
            <div className="p-8 text-center max-w-sm w-full">
                <div className="w-10 h-10 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mx-auto mb-6"></div>
                <h2 className="text-xl font-semibold text-zinc-900">Giriş Yapılıyor</h2>
                <p className="text-[15px] text-zinc-500 mt-2">Lütfen bekleyin, yönlendiriliyorsunuz...</p>
            </div>
        </div>
    );
}
