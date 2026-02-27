import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/forms/Input';
import Button from '../../components/common/Button';
import Link from '../../components/common/Link';
import { verificationService } from '../../services/authService';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [method, setMethod] = useState('email'); // 'email' | 'mobile'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (method === 'email') {
                const result = await verificationService.startPasswordResetByEmail(email);
                navigate('/reset-password/email', {
                    state: {
                        email,
                        codeIndex: result.codeIndex,
                        secretCode: result.secretCode || null,
                    },
                });
            } else {
                const result = await verificationService.startPasswordResetByMobile(email);
                navigate('/reset-password/mobile', {
                    state: {
                        email,
                        codeIndex: result.codeIndex,
                        mobile: result.mobile || null,
                        secretCode: result.secretCode || null,
                    },
                });
            }
        } catch (err) {
            const msg = err.response?.data?.message;
            const status = err.response?.status;
            if (status === 401) {
                setError('Bu e-posta adresiyle kayıtlı bir hesap bulunamadı.');
            } else if (status === 403) {
                setError('Çok sık istek gönderdiniz. Lütfen bir süre bekleyip tekrar deneyin.');
            } else if (status === 404) {
                setError('Bu e-posta adresine bağlı bir telefon numarası bulunamadı.');
            } else {
                setError(msg || 'Şifre sıfırlama başlatılırken bir hata oluştu.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="w-full">
                <h1 className="text-3xl font-bold text-zinc-900 mb-2 mt-4 tracking-tight">
                    Şifremi Unuttum
                </h1>
                <p className="text-zinc-500 mb-8 text-[15px]">
                    Kayıtlı e-posta adresinizi girin ve şifre sıfırlama yöntemini seçin.
                </p>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-[14px] font-medium border border-red-100/50 leading-relaxed shadow-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        id="email"
                        label="E-posta Adresi"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="E-posta adresinizi girin"
                        required
                    />

                    {/* Method Selection */}
                    <div>
                        <p className="block text-[14px] font-medium text-zinc-700 ml-1 mb-3">
                            Doğrulama Yöntemi
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            {/* Email Method */}
                            <button
                                type="button"
                                onClick={() => setMethod('email')}
                                className={`
                                    relative flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all duration-200
                                    ${method === 'email'
                                        ? 'border-zinc-900 bg-zinc-900 text-white shadow-lg scale-[1.02]'
                                        : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50'
                                    }
                                `}
                            >
                                <span className="text-2xl">✉️</span>
                                <div className="text-center">
                                    <p className={`text-[13px] font-semibold ${method === 'email' ? 'text-white' : 'text-zinc-800'}`}>
                                        E-posta ile
                                    </p>
                                    <p className={`text-[11px] mt-0.5 ${method === 'email' ? 'text-zinc-300' : 'text-zinc-400'}`}>
                                        Kod e-postanıza gelir
                                    </p>
                                </div>
                                {method === 'email' && (
                                    <span className="absolute top-2 right-2 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                                        <span className="w-2 h-2 bg-zinc-900 rounded-full" />
                                    </span>
                                )}
                            </button>

                            {/* Mobile Method */}
                            <button
                                type="button"
                                onClick={() => setMethod('mobile')}
                                className={`
                                    relative flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all duration-200
                                    ${method === 'mobile'
                                        ? 'border-zinc-900 bg-zinc-900 text-white shadow-lg scale-[1.02]'
                                        : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50'
                                    }
                                `}
                            >
                                <span className="text-2xl">📱</span>
                                <div className="text-center">
                                    <p className={`text-[13px] font-semibold ${method === 'mobile' ? 'text-white' : 'text-zinc-800'}`}>
                                        SMS ile
                                    </p>
                                    <p className={`text-[11px] mt-0.5 ${method === 'mobile' ? 'text-zinc-300' : 'text-zinc-400'}`}>
                                        Kod telefonunuza gelir
                                    </p>
                                </div>
                                {method === 'mobile' && (
                                    <span className="absolute top-2 right-2 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                                        <span className="w-2 h-2 bg-zinc-900 rounded-full" />
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading || !email}
                        className="w-full h-[52px] !rounded-xl"
                    >
                        {loading
                            ? 'Gönderiliyor...'
                            : method === 'email'
                                ? 'E-posta ile Kod Gönder'
                                : 'SMS ile Kod Gönder'
                        }
                    </Button>
                </form>

                <p className="mt-8 text-center text-[15px] text-zinc-600">
                    Şifrenizi hatırladınız mı?{' '}
                    <Link to="/login" variant="secondary">
                        Giriş Yap
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
