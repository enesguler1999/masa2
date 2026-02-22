import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileService } from '../../services/profileService';
import { authService } from '../../services/authService';
import { Loader2, AlertTriangle } from 'lucide-react';

export default function DeleteAccount({ user }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [confirmText, setConfirmText] = useState('');
    const navigate = useNavigate();

    const handleDelete = async () => {
        if (confirmText !== 'SİL') {
            setError('Lütfen işlemi onaylamak için kutuya SİL yazın.');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const userId = user?.userId || user?.id;

            if (!userId) {
                throw new Error("Kullanıcı kimliği bulunamadı.");
            }

            await profileService.archiveProfile(userId);

            await authService.logout();
            navigate('/login');

        } catch (err) {
            setError(err?.response?.data?.message || 'Hesap silinirken bir hata oluştu.');
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-[20px] shadow-sm border border-zinc-100 overflow-hidden flex flex-col min-h-[500px]">
            <div className="p-6 border-b border-zinc-100">
                <h2 className="text-xl font-semibold text-red-600">Hesabı Sil</h2>
                <p className="text-sm text-zinc-500 mt-1">
                    Hesabınızı kalıcı olarak silmek için aşağıdaki adımları takip edin.
                </p>
            </div>

            <div className="p-6 flex-1 flex flex-col max-w-md">
                <div className="mb-8 p-4 rounded-xl bg-red-50/50 border border-red-100 text-red-800 text-sm">
                    <div className="flex items-start gap-3 mb-2">
                        <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
                        <span className="font-semibold">Bu işlem geri alınamaz</span>
                    </div>
                    <p className="ml-8 text-red-600/90 leading-relaxed">
                        Hesabınızı sildiğinizde; profiliniz, biletleriniz, ödeme geçmişiniz ve tüm kişisel verileriniz sistemden kalıcı olarak temizlenecektir.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-zinc-700">
                            Onaylamak için büyük harflerle <strong>SİL</strong> yazın
                        </label>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            className="w-full p-3 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all text-sm"
                            placeholder="SİL"
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleDelete}
                            disabled={loading || confirmText !== 'SİL'}
                            className="w-full flex items-center justify-center p-3 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <AlertTriangle className="w-4 h-4 mr-2" />
                            )}
                            Hesabımı Kalıcı Olarak Sil
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
