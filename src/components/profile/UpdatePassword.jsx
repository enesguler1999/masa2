import React, { useState } from 'react';
import { verificationService } from '../../services/authService';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function UpdatePassword({ user }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // For step 2
    const [secretCode, setSecretCode] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleStart = async () => {
        try {
            setLoading(true);
            setError('');
            setSuccess('');

            await verificationService.startPasswordResetByMobile(user?.email);

            setStep(2);
            setSuccess('Telefonunuza doğrulama kodu gönderildi.');
        } catch (err) {
            setError(err?.response?.data?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            setSuccess('');

            await verificationService.completePasswordResetByMobile(user?.email, secretCode, newPassword);

            setSuccess('Parolanız başarıyla güncellendi.');
            setStep(1);
            setSecretCode('');
            setNewPassword('');
        } catch (err) {
            setError(err?.response?.data?.message || 'Bir hata oluştu. Kod hatalı olabilir.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-[20px] shadow-sm border border-zinc-100 overflow-hidden flex flex-col min-h-[500px]">
            <div className="p-6 border-b border-zinc-100">
                <h2 className="text-xl font-semibold text-zinc-900">Parolayı Güncelle</h2>
                <p className="text-sm text-zinc-500 mt-1">
                    Hesap güvenliğiniz için parolanızı SMS onayı ile güncelleyebilirsiniz.
                </p>
            </div>

            <div className="p-6 flex-1 flex flex-col max-w-md">
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 rounded-xl bg-green-50 text-green-700 text-sm flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                        <span>{success}</span>
                    </div>
                )}

                {step === 1 ? (
                    <div className="space-y-6">
                        <div className="bg-zinc-50 p-4 rounded-xl text-sm text-zinc-600">
                            İşlemi başlattığınızda sistemde kayıtlı olan telefon numaranıza bir doğrulama kodu gönderilecektir.
                        </div>
                        <button
                            onClick={handleStart}
                            disabled={loading}
                            className="w-full flex items-center justify-center p-3 rounded-xl bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            SMS ile Sıfırlama Başlat
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleComplete} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-700">Doğrulama Kodu</label>
                            <input
                                type="text"
                                value={secretCode}
                                onChange={(e) => setSecretCode(e.target.value)}
                                className="w-full p-3 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all text-sm"
                                placeholder="SMS ile gelen kod"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-700">Yeni Parola</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full p-3 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all text-sm"
                                placeholder="Yeni parolanız"
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="pt-2 flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setStep(1);
                                    setSuccess('');
                                    setError('');
                                    setSecretCode('');
                                    setNewPassword('');
                                }}
                                disabled={loading}
                                className="flex-1 p-3 rounded-xl border border-zinc-200 text-zinc-700 text-sm font-medium hover:bg-zinc-50 transition-colors disabled:opacity-50"
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !secretCode || !newPassword}
                                className="flex-1 flex items-center justify-center p-3 rounded-xl bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-70"
                            >
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Güncelle
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
