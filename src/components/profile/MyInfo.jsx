import React from 'react';
import Button from '../common/Button';

const maskEmail = (email) => {
    if (!email) return '';
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    const [name, domain] = parts;
    if (name.length <= 2) return `${name[0]}***@${domain}`;
    return `${name[0]}*********${name[name.length - 1]}@${domain}`;
};

const maskPhone = (phone) => {
    if (!phone) return '+905********00';
    const clean = phone.replace(/\s+/g, '');
    if (clean.length < 6) return clean;
    return `${clean.substring(0, 4)}********${clean.substring(clean.length - 2)}`;
};

export default function MyInfo({ user }) {
    return (
        <div className="bg-white rounded-[20px] shadow-sm border border-zinc-100 overflow-hidden flex flex-col min-h-[500px]">
            <div className="p-6 border-b border-zinc-100">
                <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Kişisel Bilgilerim</h2>
                <p className="text-zinc-500 text-[14px] mt-1">Hesabınıza ait temel bilgileri buradan görüntüleyebilir ve güncelleyebilirsiniz.</p>
            </div>

            <div className="p-6 flex-1">
                <form className="max-w-xl space-y-5">
                    <div>
                        <label className="block text-[14px] font-medium text-zinc-700 mb-1.5 ml-1">Ad Soyad</label>
                        <input
                            type="text"
                            defaultValue={user?.fullname}
                            className="w-full h-[52px] bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all text-[15px]"
                        />
                    </div>

                    <div>
                        <label className="block text-[14px] font-medium text-zinc-700 mb-1.5 ml-1">Kısa Biyografi (Bio)</label>
                        <textarea
                            rows={3}
                            placeholder="Kendinizden kısaca bahsedin..."
                            className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all text-[15px] resize-none"
                        ></textarea>
                    </div>

                    <div className="flex gap-4 flex-col sm:flex-row">
                        <div className="flex-1">
                            <label className="block text-[14px] font-medium text-zinc-700 mb-1.5 ml-1">E-Posta Adresi</label>
                            <input
                                type="text"
                                readOnly
                                value={maskEmail(user?.email || 'e********9@hotmail.com')}
                                className="w-full h-[52px] bg-zinc-100 border border-zinc-200 text-zinc-500 rounded-xl px-4 focus:outline-none text-[15px] cursor-not-allowed"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-[14px] font-medium text-zinc-700 mb-1.5 ml-1">Telefon Numarası</label>
                            <input
                                type="text"
                                readOnly
                                value={maskPhone(user?.mobile || '+905441234567')}
                                className="w-full h-[52px] bg-zinc-100 border border-zinc-200 text-zinc-500 rounded-xl px-4 focus:outline-none text-[15px] cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button className="h-[48px] px-8 !rounded-xl">Değişiklikleri Kaydet</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
