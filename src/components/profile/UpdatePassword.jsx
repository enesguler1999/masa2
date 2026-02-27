import React, { useState } from 'react';
import { profileService } from '../../services/profileService';
import { Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

function PasswordInput({ label, value, onChange, placeholder, id }) {
    const [show, setShow] = useState(false);
    return (
        <div className="space-y-1.5">
            <label htmlFor={id} className="block text-[14px] font-medium text-zinc-700">{label}</label>
            <div className="relative">
                <input
                    id={id}
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required
                    minLength={id === 'oldPassword' ? 1 : 6}
                    className="w-full pr-12 p-3 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all text-[15px]"
                />
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
                    tabIndex={-1}
                >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
        </div>
    );
}

export default function UpdatePassword({ user }) {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword.length < 6) {
            setError('Yeni şifre en az 6 karakter olmalıdır.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Yeni şifreler eşleşmiyor.');
            return;
        }
        if (oldPassword === newPassword) {
            setError('Yeni şifre eski şifrenizden farklı olmalıdır.');
            return;
        }

        setLoading(true);
        try {
            const userId = user?.id || user?.userId;
            if (!userId) throw new Error('Kullanıcı kimliği bulunamadı.');

            await profileService.updateUserPassword(userId, oldPassword, newPassword);

            setSuccess('Şifreniz başarıyla güncellendi.');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err?.response?.data?.message || 'Şifre güncellenirken bir hata oluştu. Mevcut şifrenizi kontrol edin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-[20px] shadow-sm border border-zinc-100 overflow-hidden flex flex-col min-h-[500px]">
            <div className="p-6 border-b border-zinc-100">
                <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Şifre Güncelle</h2>
                <p className="text-zinc-500 text-[14px] mt-1">
                    Mevcut şifrenizi girerek yeni bir şifre belirleyebilirsiniz.
                </p>
            </div>

            <div className="p-6 flex-1">
                <form onSubmit={handleSubmit} className="max-w-md space-y-5">
                    {error && (
                        <div className="p-4 rounded-xl bg-red-50 text-red-600 text-[14px] flex items-start gap-3 border border-red-100">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="p-4 rounded-xl bg-green-50 text-green-700 text-[14px] flex items-start gap-3 border border-green-100">
                            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                            <span>{success}</span>
                        </div>
                    )}

                    <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 text-[13px] text-zinc-600">
                        Hesap güvenliğiniz için mevcut şifrenizi doğrulamanız gerekmektedir.
                    </div>

                    <PasswordInput
                        id="oldPassword"
                        label="Mevcut Şifre"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Mevcut şifrenizi girin"
                    />

                    <div className="border-t border-zinc-100 pt-5 space-y-4">
                        <PasswordInput
                            id="newPassword"
                            label="Yeni Şifre"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="En az 6 karakter"
                        />
                        <PasswordInput
                            id="confirmPassword"
                            label="Yeni Şifre (Tekrar)"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Yeni şifrenizi tekrar girin"
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading || !oldPassword || !newPassword || !confirmPassword}
                            className="w-full flex items-center justify-center h-[48px] rounded-xl bg-zinc-900 text-white text-[14px] font-semibold hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
