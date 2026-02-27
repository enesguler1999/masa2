import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import Button from '../common/Button';
import { profileService } from '../../services/profileService';
import { bucketService } from '../../services/bucketService';
import { authService } from '../../services/authService';
import { CheckCircle2, AlertCircle, Camera, Globe, Lock, Loader2 } from 'lucide-react';
import { useUser } from '../../context/UserContext';

// ── Crop helper ──────────────────────────────────────────────────────────────
function createImage(url) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (err) => reject(err));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });
}

async function getCroppedImg(imageSrc, pixelCrop) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
        image,
        pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
        0, 0, pixelCrop.width, pixelCrop.height
    );
    return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92);
    });
}

// ── Avatar Crop Modal ─────────────────────────────────────────────────────────
function AvatarCropModal({ imageSrc, onDone, onCancel }) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropComplete = useCallback((_, pixels) => {
        setCroppedAreaPixels(pixels);
    }, []);

    const handleDone = async () => {
        const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
        onDone(blob);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-5 border-b border-zinc-100">
                    <h3 className="text-[16px] font-bold text-zinc-900">Fotoğrafı Kırp</h3>
                </div>
                <div className="relative w-full" style={{ height: 320, background: '#111' }}>
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />
                </div>
                <div className="px-5 pt-4 pb-2">
                    <label className="block text-[12px] font-medium text-zinc-500 mb-1.5">Yakınlaştır</label>
                    <input
                        type="range" min={1} max={3} step={0.05}
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-full accent-black"
                    />
                </div>
                <div className="flex gap-3 px-5 py-4">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 text-[14px] font-semibold hover:bg-zinc-50 transition-colors"
                    >
                        İptal
                    </button>
                    <button
                        onClick={handleDone}
                        className="flex-1 py-2.5 rounded-xl bg-black text-white text-[14px] font-semibold hover:bg-zinc-800 transition-colors"
                    >
                        Uygula
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function MyInfo({ user, onUserUpdate }) {
    const { updateUser } = useUser();
    const [fullname, setFullname] = useState(user?.fullname || '');
    const [mobile, setMobile] = useState(user?.mobile || '');
    const [isPublic, setIsPublic] = useState(user?.isPublic ?? true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Avatar
    const [rawImageSrc, setRawImageSrc] = useState(null);
    const [showCrop, setShowCrop] = useState(false);
    const [croppedBlob, setCroppedBlob] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
    const [avatarUploading, setAvatarUploading] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setRawImageSrc(reader.result);
            setShowCrop(true);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleCropDone = (blob) => {
        setCroppedBlob(blob);
        setAvatarPreview(URL.createObjectURL(blob));
        setShowCrop(false);
        setRawImageSrc(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSaving(true);

        try {
            const userId = user?.id;
            if (!userId) throw new Error('Kullanıcı kimliği bulunamadı.');

            let avatarUrl = user?.avatar;

            // Upload new avatar if cropped
            if (croppedBlob) {
                setAvatarUploading(true);
                try {
                    const session = await authService.getCurrentUser();
                    const bucketToken = session.userBucketToken;
                    const bucketId = `${session.userId}-public-user-bucket`;
                    const file = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' });
                    const uploadResult = await bucketService.uploadFile(bucketToken, bucketId, file);
                    avatarUrl = uploadResult?.data?.[0]?.downloadUrl || avatarUrl;
                } finally {
                    setAvatarUploading(false);
                }
            }

            const result = await profileService.updateProfile(userId, {
                fullname,
                mobile,
                isPublic,
                ...(avatarUrl ? { avatar: avatarUrl } : {}),
            });

            setCroppedBlob(null);
            setSuccess('Profiliniz başarıyla güncellendi.');
            // Update local page state
            if (onUserUpdate) onUserUpdate(result.user);
            // Update global context so Header re-renders immediately
            updateUser(result.user);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Güncelleme sırasında bir hata oluştu.');
        } finally {
            setSaving(false);
        }
    };

    const currentAvatar = avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullname || 'U')}&background=0D8ABC&color=fff&size=200`;

    return (
        <>
            {showCrop && rawImageSrc && (
                <AvatarCropModal
                    imageSrc={rawImageSrc}
                    onDone={handleCropDone}
                    onCancel={() => { setShowCrop(false); setRawImageSrc(null); }}
                />
            )}

            <div className="bg-white rounded-[20px] shadow-sm border border-zinc-100 overflow-hidden flex flex-col min-h-[500px]">
                <div className="p-6 border-b border-zinc-100">
                    <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Kişisel Bilgilerim</h2>
                    <p className="text-zinc-500 text-[14px] mt-1">Hesabınıza ait temel bilgileri buradan görüntüleyebilir ve güncelleyebilirsiniz.</p>
                </div>

                <div className="p-6 flex-1">
                    {error && (
                        <div className="mb-5 p-4 bg-red-50 text-red-600 rounded-xl text-[14px] font-medium flex items-start gap-3 border border-red-100">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-5 p-4 bg-green-50 text-green-700 rounded-xl text-[14px] font-medium flex items-start gap-3 border border-green-100">
                            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSave} className="space-y-6">
                        {/* Avatar */}
                        <div className="flex items-center gap-5">
                            <div className="relative shrink-0">
                                <img
                                    src={currentAvatar}
                                    alt="Avatar"
                                    className="w-20 h-20 rounded-full object-cover ring-4 ring-zinc-100"
                                />
                                <label
                                    htmlFor="avatar-input"
                                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-black rounded-full flex items-center justify-center cursor-pointer hover:bg-zinc-800 transition-colors shadow-md"
                                >
                                    <Camera size={14} className="text-white" />
                                    <input id="avatar-input" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                </label>
                            </div>
                            <div>
                                <p className="font-semibold text-zinc-900 text-[15px]">{user?.fullname}</p>
                                <p className="text-zinc-500 text-[13px]">{user?.email}</p>
                                {croppedBlob && (
                                    <span className="text-[12px] text-indigo-600 font-medium">Yeni fotoğraf seçildi — kaydetmeyi unutmayın</span>
                                )}
                            </div>
                        </div>

                        {/* Fields */}
                        <div className="max-w-xl space-y-5">
                            <div>
                                <label className="block text-[14px] font-medium text-zinc-700 mb-1.5 ml-1">Ad Soyad</label>
                                <input
                                    type="text"
                                    value={fullname}
                                    onChange={(e) => setFullname(e.target.value)}
                                    className="w-full h-[52px] bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all text-[15px]"
                                    required
                                />
                            </div>

                            <div className="flex gap-4 flex-col sm:flex-row">
                                <div className="flex-1">
                                    <label className="block text-[14px] font-medium text-zinc-700 mb-1.5 ml-1">E-Posta Adresi</label>
                                    <input
                                        type="text" readOnly value={user?.email || ''}
                                        className="w-full h-[52px] bg-zinc-100 border border-zinc-200 text-zinc-500 rounded-xl px-4 focus:outline-none text-[15px] cursor-not-allowed"
                                    />
                                    <p className="text-[12px] text-zinc-400 mt-1 ml-1">E-posta adresi değiştirilemez.</p>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-[14px] font-medium text-zinc-700 mb-1.5 ml-1">Telefon Numarası</label>
                                    <input
                                        type="tel"
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value)}
                                        placeholder="+905554443322"
                                        className="w-full h-[52px] bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all text-[15px]"
                                    />
                                </div>
                            </div>

                            {/* isPublic toggle */}
                            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {isPublic ? <Globe size={18} className="text-zinc-700" /> : <Lock size={18} className="text-zinc-700" />}
                                        <div>
                                            <p className="font-semibold text-[14px] text-zinc-900">
                                                {isPublic ? 'Herkese Açık Profil' : 'Gizli Profil'}
                                            </p>
                                            <p className="text-[12px] text-zinc-500 mt-0.5">
                                                {isPublic
                                                    ? 'Profiliniz herkese görünür durumda.'
                                                    : 'Profiliniz yalnizca size görünür.'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsPublic(!isPublic)}
                                        className={`w-12 h-6 rounded-full transition-colors duration-200 relative shrink-0 ${isPublic ? 'bg-black' : 'bg-zinc-300'}`}
                                    >
                                        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${isPublic ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end max-w-xl">
                            <Button
                                type="submit"
                                disabled={saving}
                                className="h-[48px] px-8 !rounded-xl flex items-center gap-2"
                            >
                                {(saving || avatarUploading) && <Loader2 size={16} className="animate-spin" />}
                                {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
