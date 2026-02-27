import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileService } from '../../services/profileService';
import { authService } from '../../services/authService';
import { Loader2, AlertTriangle, ShieldAlert, Clock } from 'lucide-react';

const CONFIRM_PHRASE = 'HESABIMI ARŞİVLE';

export default function DeleteAccount({ user }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [confirmText, setConfirmText] = useState('');
    const [showDialog, setShowDialog] = useState(false);
    const navigate = useNavigate();

    const handleArchive = async () => {
        if (confirmText !== CONFIRM_PHRASE) {
            setError(`Lütfen onaylamak için tam olarak "${CONFIRM_PHRASE}" yazın.`);
            return;
        }

        try {
            setLoading(true);
            setError('');

            const userId = user?.id || user?.userId;
            if (!userId) throw new Error('Kullanıcı kimliği bulunamadı.');

            await profileService.archiveProfile(userId);
            await authService.logout();
            navigate('/login', {
                state: { successMessage: 'Hesabınız arşivlendi. Tekrar giriş yaparak 1 ay içinde geri yükleyebilirsiniz.' }
            });
        } catch (err) {
            setError(err?.response?.data?.message || 'Hesap arşivlenirken bir hata oluştu.');
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-[20px] shadow-sm border border-zinc-100 overflow-hidden flex flex-col min-h-[500px]">
            <div className="p-6 border-b border-zinc-100">
                <h2 className="text-xl font-bold text-red-600 tracking-tight">Hesabı Arşivle</h2>
                <p className="text-zinc-500 text-[14px] mt-1">
                    Hesabınızı geçici olarak devre dışı bırakabilirsiniz.
                </p>
            </div>

            <div className="p-6 flex-1 max-w-lg flex flex-col gap-6">
                {/* Info blocks */}
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-[13.5px] text-amber-800">
                        <p className="font-semibold mb-1">1 Aylık Geri Yükleme Süresi</p>
                        <p className="leading-relaxed">
                            Hesabınızı arşivlediğinizde tüm verileriniz 1 ay boyunca saklanır.
                            Bu süre içinde aynı e-posta ile giriş yaparak veya kayıt olarak hesabınızı
                            otomatik olarak geri yükleyebilirsiniz.
                        </p>
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="text-[13.5px] text-red-700">
                        <p className="font-semibold mb-1">1 Ay Sonra Kalıcı Silme</p>
                        <p className="leading-relaxed">
                            Arşivleme tarihinden itibaren 1 ay içinde giriş yapılmaz veya kayıt olunmazsa,
                            profiliniz ve tüm ilişkili veriler <strong>kalıcı olarak silinir</strong>.
                        </p>
                    </div>
                </div>

                {/* Confirmation */}
                {!showDialog ? (
                    <button
                        onClick={() => setShowDialog(true)}
                        className="mt-auto flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-red-200 text-red-600 text-[14px] font-semibold hover:bg-red-50 transition-colors"
                    >
                        <ShieldAlert size={18} />
                        Hesabımı Arşivlemek İstiyorum
                    </button>
                ) : (
                    <div className="mt-auto space-y-4 p-5 bg-zinc-50 rounded-xl border border-zinc-200">
                        <p className="text-[14px] text-zinc-700 font-medium">
                            Devam etmek için aşağıya tam olarak{' '}
                            <strong className="text-red-600 font-bold">{CONFIRM_PHRASE}</strong>{' '}
                            yazın:
                        </p>

                        {error && (
                            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-[13px] border border-red-100">
                                {error}
                            </div>
                        )}

                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => { setConfirmText(e.target.value); setError(''); }}
                            placeholder={CONFIRM_PHRASE}
                            className="w-full p-3 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-400 transition-all text-[14px] font-mono"
                        />

                        <div className="flex gap-3 pt-1">
                            <button
                                type="button"
                                onClick={() => { setShowDialog(false); setConfirmText(''); setError(''); }}
                                disabled={loading}
                                className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 text-[14px] font-semibold hover:bg-zinc-50 transition-colors"
                            >
                                Vazgeç
                            </button>
                            <button
                                onClick={handleArchive}
                                disabled={loading || confirmText !== CONFIRM_PHRASE}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 text-white text-[14px] font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Arşivle
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
