import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/forms/Input';
import Button from '../../components/common/Button';
import { verificationService } from '../../services/authService';

export default function VerifyEmail() {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Look for email in state or search params
    const email = location.state?.email || searchParams.get('email');
    const paramCode = searchParams.get('code');

    useEffect(() => {
        if (!email) {
            navigate('/login');
        }
        if (paramCode) {
            setCode(paramCode);
            // Optionally auto-verify if code exists in URL
        }
    }, [email, navigate, paramCode]);

    const handleVerify = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await verificationService.completeEmailVerification(email, code);
            if (result.isVerified) {
                navigate('/login', { state: { successMessage: 'E-posta adresiniz başarıyla doğrulandı. Lütfen giriş yapın.' } });
            } else {
                setError('Doğrulama başarısız oldu. Lütfen tekrar deneyin.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Geçersiz veya süresi dolmuş doğrulama bağlantısı.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError('');
        setSuccessMessage('');
        setResendLoading(true);
        try {
            await verificationService.startEmailVerification(email);
            setSuccessMessage('Doğrulama e-postası tekrar gönderildi. Lütfen gelen kutunuzu kontrol edin.');
        } catch (err) {
            setError(err.response?.data?.message || 'E-posta gönderilirken bir hata oluştu.');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="w-full">
                <h1 className="text-3xl font-bold text-zinc-900 mb-2 mt-4 tracking-tight">E-posta Doğrulaması</h1>
                <p className="text-zinc-500 mb-8 text-[15px]">
                    Lütfen <strong>{email}</strong> adresinize gönderilen e-postadaki yönlendirmeyi takip edin veya doğrulama kodunu aşağıya girin.
                </p>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-[14px] font-medium border border-red-100/50 leading-relaxed shadow-sm">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-xl text-[14px] font-medium border border-green-100/50 leading-relaxed shadow-sm">
                        {successMessage}
                    </div>
                )}

                <form onSubmit={handleVerify} className="space-y-4">
                    <Input
                        id="code"
                        label="Doğrulama Kodu (İsteğe bağlı)"
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Eğer kodu manuel girmek isterseniz"
                        required
                    />

                    <Button
                        type="submit"
                        disabled={loading || !code}
                        className="w-full mt-4 h-[52px] !rounded-xl"
                    >
                        {loading ? 'Doğrulanıyor...' : 'Doğrula'}
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-[15px] text-zinc-600">
                        E-posta gelmedi mi?{' '}
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resendLoading}
                            className="text-zinc-900 font-medium hover:underline disabled:opacity-50 transition-opacity"
                        >
                            {resendLoading ? 'Gönderiliyor...' : 'Tekrar Gönder'}
                        </button>
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
}
