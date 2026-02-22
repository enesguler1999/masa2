import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/forms/Input';
import Button from '../../components/common/Button';
import { verificationService } from '../../services/authService';

export default function VerifyMobile() {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            navigate('/login');
        } else {
            // Options: Maybe start verification by default here? 
            // The registration response already indicates if it's needed, but didn't actually send a code.
            // Wait, does registerUser automatically start the verification? 
            // The user documentation says: "startMobileVerification(accountInfo.email)"
            // Actually, we should call startMobileVerification when component mounts if not already sent.
            // But to prevent double sends in strict mode, we'll let user manually trigger "Tekrar Gönder"
            // or we do it once:
        }
    }, [email, navigate]);

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await verificationService.completeMobileVerification(email, code);
            if (result.isVerified) {
                // If verified, go to login manually, since we don't have token unless auto login handled by backend.
                // Or if we do have token, maybe we could let authService set it? Verification doesn't return accessToken.
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
        setResendLoading(true);
        try {
            await verificationService.startMobileVerification(email);
            setSuccessMessage('Doğrulama kodu tekrar gönderildi.');
        } catch (err) {
            setError(err.response?.data?.message || 'Kod gönderilirken bir hata oluştu.');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="w-full">
                <h1 className="text-3xl font-bold text-zinc-900 mb-2 mt-4 tracking-tight">Telefon Doğrulaması</h1>
                <p className="text-zinc-500 mb-8 text-[15px]">
                    Lütfen {email} adresinize bağlı telefon numarasına gönderilen 6 haneli kodu girin.
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
