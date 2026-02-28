import React, { useState, useCallback, useEffect, useRef } from 'react';
import Cropper from 'react-easy-crop';
import {
    Search, UserPlus, Edit2, Trash2, Key, ShieldCheck,
    ChevronLeft, ChevronRight, AlertCircle, CheckCircle2,
    Camera, Globe, Lock, Loader2, X, Eye, EyeOff, RefreshCw,
    Crown, Shield, User as UserIcon,
} from 'lucide-react';
import { userAdminService, ROLES } from '../../services/userAdminService';
import { bucketService } from '../../services/bucketService';
import { authService } from '../../services/authService';
import { useUser } from '../../context/UserContext';

// ─────────────────────────────────────────────
// Crop helpers (reused from profile/MyInfo.jsx)
// ─────────────────────────────────────────────
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
    ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
    return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92));
}

// ─────────────────────────────────────────────
// Crop Modal
// ─────────────────────────────────────────────
function AvatarCropModal({ imageSrc, onDone, onCancel }) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const onCropComplete = useCallback((_, pixels) => setCroppedAreaPixels(pixels), []);
    const handleDone = async () => { const blob = await getCroppedImg(imageSrc, croppedAreaPixels); onDone(blob); };

    return (
        <div className="fixed inset-0 z-[60] bg-black/75 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
                    <h3 className="text-[16px] font-bold text-zinc-900">Fotoğrafı Kırp</h3>
                    <button onClick={onCancel} className="p-1 rounded-full hover:bg-zinc-100 transition-colors"><X size={18} /></button>
                </div>
                <div className="relative w-full" style={{ height: 300, background: '#111' }}>
                    <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} cropShape="round" showGrid={false}
                        onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
                </div>
                <div className="px-5 pt-4 pb-2">
                    <label className="block text-[12px] font-medium text-zinc-500 mb-1.5">Yakınlaştır</label>
                    <input type="range" min={1} max={3} step={0.05} value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-black" />
                </div>
                <div className="flex gap-3 px-5 py-4">
                    <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 text-[14px] font-semibold hover:bg-zinc-50 transition-colors">İptal</button>
                    <button onClick={handleDone} className="flex-1 py-2.5 rounded-xl bg-black text-white text-[14px] font-semibold hover:bg-zinc-800 transition-colors">Uygula</button>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Role Badge
// ─────────────────────────────────────────────
function RoleBadge({ roleId }) {
    const cfg = {
        superAdmin: { label: 'Super Admin', icon: Crown, cls: 'bg-amber-50 border-amber-200 text-amber-700' },
        admin: { label: 'Admin', icon: Shield, cls: 'bg-blue-50 border-blue-200 text-blue-700' },
        user: { label: 'Kullanıcı', icon: UserIcon, cls: 'bg-zinc-50 border-zinc-200 text-zinc-600' },
    };
    const { label, icon: Icon, cls } = cfg[roleId] || cfg.user;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold ${cls}`}>
            <Icon size={10} />{label}
        </span>
    );
}

// ─────────────────────────────────────────────
// Confirmation Dialog
// ─────────────────────────────────────────────
function ConfirmDialog({ open, title, message, confirmLabel = 'Onayla', danger = false, onConfirm, onCancel, loading }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
                <div className="p-6">
                    <h3 className="text-[17px] font-bold text-zinc-900 mb-2">{title}</h3>
                    <p className="text-[14px] text-zinc-500">{message}</p>
                </div>
                <div className="px-6 pb-6 flex gap-3 justify-end">
                    <button onClick={onCancel} disabled={loading}
                        className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700 text-[14px] font-semibold hover:bg-zinc-50 transition-colors disabled:opacity-50">
                        İptal
                    </button>
                    <button onClick={onConfirm} disabled={loading}
                        className={`px-4 py-2 rounded-xl text-white text-[14px] font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-black hover:bg-zinc-800'}`}>
                        {loading && <Loader2 size={14} className="animate-spin" />}{confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Flash message
// ─────────────────────────────────────────────
function Flash({ type, message, onClose }) {
    if (!message) return null;
    const ok = type === 'success';
    return (
        <div className={`flex items-center gap-3 p-3.5 rounded-xl text-[13px] font-medium border mb-4 ${ok ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
            {ok ? <CheckCircle2 size={15} className="shrink-0" /> : <AlertCircle size={15} className="shrink-0" />}
            <span className="flex-1">{message}</span>
            <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"><X size={14} /></button>
        </div>
    );
}

// ─────────────────────────────────────────────
// Input field
// ─────────────────────────────────────────────
function Field({ label, error, children, hint }) {
    return (
        <div>
            {label && <label className="block text-[13px] font-medium text-zinc-700 mb-1.5 ml-0.5">{label}</label>}
            {children}
            {hint && <p className="text-[12px] text-zinc-400 mt-1 ml-0.5">{hint}</p>}
            {error && <p className="text-[12px] text-red-500 mt-1 ml-0.5">{error}</p>}
        </div>
    );
}

const inputCls = 'w-full h-[46px] bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-3.5 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all text-[14px] placeholder:text-zinc-400';
const readonlyCls = 'w-full h-[46px] bg-zinc-100 border border-zinc-200 text-zinc-400 rounded-xl px-3.5 text-[14px] cursor-not-allowed';

// ─────────────────────────────────────────────
// Avatar uploader with crop
// ─────────────────────────────────────────────
function AvatarUploader({ avatarUrl, onBlobReady, name }) {
    const [rawSrc, setRawSrc] = useState(null);
    const [showCrop, setShowCrop] = useState(false);
    const [preview, setPreview] = useState(avatarUrl || null);

    const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=18181b&color=fff&size=200`;

    const handleFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => { setRawSrc(reader.result); setShowCrop(true); };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleDone = (blob) => {
        setPreview(URL.createObjectURL(blob));
        setShowCrop(false);
        setRawSrc(null);
        onBlobReady(blob);
    };

    return (
        <>
            {showCrop && rawSrc && <AvatarCropModal imageSrc={rawSrc} onDone={handleDone} onCancel={() => { setShowCrop(false); setRawSrc(null); }} />}
            <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                    <img src={preview || fallback} alt="Avatar" className="w-16 h-16 rounded-full object-cover ring-4 ring-zinc-100" />
                    <label htmlFor="um-avatar-input" className="absolute -bottom-1 -right-1 w-7 h-7 bg-black rounded-full flex items-center justify-center cursor-pointer hover:bg-zinc-800 transition-colors shadow-md">
                        <Camera size={13} className="text-white" />
                        <input id="um-avatar-input" type="file" accept="image/*" className="hidden" onChange={handleFile} />
                    </label>
                </div>
                <p className="text-[12px] text-zinc-500">Yeni fotoğraf yüklemek için kamera ikonuna tıklayın.</p>
            </div>
        </>
    );
}

// ─────────────────────────────────────────────
// Create / Edit User drawer / modal
// ─────────────────────────────────────────────
function UserFormModal({ mode, targetUser, currentUser, onClose, onSaved }) {
    const isSuperAdmin = currentUser?.roleId === ROLES.superAdmin;
    const isAdmin = currentUser?.roleId === ROLES.admin;

    const [fullname, setFullname] = useState(targetUser?.fullname || '');
    const [email, setEmail] = useState(targetUser?.email || '');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [mobile, setMobile] = useState(targetUser?.mobile || '');
    const [isPublic, setIsPublic] = useState(targetUser?.isPublic ?? true);
    const [avatarBlob, setAvatarBlob] = useState(null);
    const [saving, setSaving] = useState(false);
    const [flash, setFlash] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFlash(null);

        try {
            let avatarUrl = targetUser?.avatar || undefined;

            // Upload avatar if any
            if (avatarBlob) {
                const session = await authService.getCurrentUser();
                const token = session.applicationBucketToken;
                const file = new File([avatarBlob], 'avatar.jpg', { type: 'image/jpeg' });
                const result = await bucketService.uploadFile(token, 'masaapp-public-common-bucket', file);
                avatarUrl = result?.data?.[0]?.downloadUrl || avatarUrl;
            }

            if (mode === 'create') {
                await userAdminService.createUser({ fullname, email, password, mobile, isPublic, ...(avatarUrl ? { avatar: avatarUrl } : {}) });
                setFlash({ type: 'success', message: 'Kullanıcı başarıyla oluşturuldu.' });
            } else {
                await userAdminService.updateUser(targetUser.id, { fullname, mobile, isPublic, ...(avatarUrl ? { avatar: avatarUrl } : {}) });
                setFlash({ type: 'success', message: 'Kullanıcı güncellendi.' });
            }

            onSaved();
            onClose();
        } catch (err) {
            setFlash({ type: 'error', message: err.response?.data?.message || err.message || 'Bir hata oluştu.' });
        } finally {
            setSaving(false);
        }
    };

    const title = mode === 'create' ? 'Yeni Kullanıcı' : 'Kullanıcıyı Düzenle';

    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                    <h3 className="text-[17px] font-bold text-zinc-900">{title}</h3>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-zinc-100 transition-colors"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="px-6 py-5 space-y-4">
                        <Flash {...(flash || {})} onClose={() => setFlash(null)} />

                        {/* Avatar */}
                        <AvatarUploader
                            avatarUrl={targetUser?.avatar}
                            name={fullname || targetUser?.fullname}
                            onBlobReady={setAvatarBlob}
                        />

                        <Field label="Ad Soyad">
                            <input type="text" value={fullname} onChange={(e) => setFullname(e.target.value)} required
                                placeholder="John Doe" className={inputCls} />
                        </Field>

                        {mode === 'create' ? (
                            <Field label="E-Posta">
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                                    placeholder="ornek@email.com" className={inputCls} />
                            </Field>
                        ) : (
                            <Field label="E-Posta" hint="E-posta adresi değiştirilemez.">
                                <input type="text" value={email || targetUser?.email} readOnly className={readonlyCls} />
                            </Field>
                        )}

                        {mode === 'create' && (
                            <Field label="Şifre">
                                <div className="relative">
                                    <input type={showPw ? 'text' : 'password'} value={password}
                                        onChange={(e) => setPassword(e.target.value)} required minLength={6}
                                        placeholder="En az 6 karakter" className={inputCls + ' pr-11'} />
                                    <button type="button" onClick={() => setShowPw(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors">
                                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </Field>
                        )}

                        <Field label="Telefon Numarası">
                            <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)}
                                placeholder="+905554443322" className={inputCls} required={mode === 'create'} />
                        </Field>

                        {/* isPublic toggle */}
                        <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                    {isPublic ? <Globe size={16} className="text-zinc-600" /> : <Lock size={16} className="text-zinc-600" />}
                                    <div>
                                        <p className="font-semibold text-[13px] text-zinc-900">{isPublic ? 'Herkese Açık Profil' : 'Gizli Profil'}</p>
                                        <p className="text-[12px] text-zinc-400 mt-0.5">{isPublic ? 'Profil herkese görünür.' : 'Profil yalnızca kullanıcıya görünür.'}</p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => setIsPublic(v => !v)}
                                    className={`w-11 h-5.5 rounded-full transition-colors duration-200 relative shrink-0 flex items-center ${isPublic ? 'bg-black' : 'bg-zinc-300'}`}
                                    style={{ height: 22 }}>
                                    <span className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform duration-200 ${isPublic ? 'translate-x-5' : 'translate-x-0.5'}`}
                                        style={{ width: 17, height: 17 }} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-3">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700 text-[14px] font-semibold hover:bg-zinc-50 transition-colors">
                            İptal
                        </button>
                        <button type="submit" disabled={saving}
                            className="px-5 py-2 rounded-xl bg-black text-white text-[14px] font-semibold hover:bg-zinc-800 transition-colors flex items-center gap-2 disabled:opacity-50">
                            {saving && <Loader2 size={14} className="animate-spin" />}
                            {mode === 'create' ? 'Oluştur' : 'Kaydet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Update Role Modal
// ─────────────────────────────────────────────
function UpdateRoleModal({ targetUser, currentUser, onClose, onSaved }) {
    const isSuperAdmin = currentUser?.roleId === ROLES.superAdmin;
    const [roleId, setRoleId] = useState(targetUser?.roleId || ROLES.user);
    const [saving, setSaving] = useState(false);
    const [flash, setFlash] = useState(null);

    // Rules: superAdmin role can never be assigned by anyone.
    // Admin role only by superAdmin. User role by both admin & superAdmin.
    const availableRoles = Object.values(ROLES).filter(r => {
        if (r === ROLES.superAdmin) return false; // Never assignable
        if (r === ROLES.admin) return isSuperAdmin; // Only superAdmin can assign admin
        return true; // user role always available
    });

    // Can't unassign superAdmin
    const isTargetSuperAdmin = targetUser?.roleId === ROLES.superAdmin;

    const handleSave = async () => {
        if (isTargetSuperAdmin) return;
        setSaving(true);
        setFlash(null);
        try {
            await userAdminService.updateUserRole(targetUser.id, roleId);
            onSaved();
            onClose();
        } catch (err) {
            setFlash({ type: 'error', message: err.response?.data?.message || err.message || 'Bir hata oluştu.' });
            setSaving(false);
        }
    };

    const roleLabels = { superAdmin: 'Super Admin', admin: 'Admin', user: 'Kullanıcı' };
    const roleIcons = { superAdmin: Crown, admin: Shield, user: UserIcon };
    const roleColors = { superAdmin: 'border-amber-300 bg-amber-50 text-amber-800', admin: 'border-blue-300 bg-blue-50 text-blue-800', user: 'border-zinc-300 bg-zinc-50 text-zinc-800' };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                    <h3 className="text-[17px] font-bold text-zinc-900">Rol Güncelle</h3>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-zinc-100 transition-colors"><X size={18} /></button>
                </div>
                <div className="px-6 py-5">
                    <Flash {...(flash || {})} onClose={() => setFlash(null)} />

                    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-zinc-100">
                        <img src={targetUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(targetUser?.fullname || 'U')}&background=18181b&color=fff&size=100`}
                            className="w-10 h-10 rounded-full object-cover" alt="" />
                        <div>
                            <p className="font-semibold text-[14px] text-zinc-900">{targetUser?.fullname}</p>
                            <p className="text-[12px] text-zinc-400">{targetUser?.email}</p>
                        </div>
                    </div>

                    {isTargetSuperAdmin ? (
                        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-[13px] text-amber-700 flex items-center gap-2">
                            <Crown size={15} className="shrink-0" />
                            Super Admin rolü kaldırılamaz.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {availableRoles.map(r => {
                                const Icon = roleIcons[r];
                                const isSelected = roleId === r;
                                return (
                                    <button key={r} type="button" onClick={() => setRoleId(r)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${isSelected ? roleColors[r] + ' ring-1 ring-inset ring-current' : 'border-zinc-200 hover:bg-zinc-50'}`}>
                                        <Icon size={16} className="shrink-0" />
                                        <span className="font-semibold text-[13px]">{roleLabels[r]}</span>
                                        {isSelected && <CheckCircle2 size={14} className="ml-auto" />}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
                <div className="px-6 pb-5 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700 text-[14px] font-semibold hover:bg-zinc-50 transition-colors">İptal</button>
                    {!isTargetSuperAdmin && (
                        <button onClick={handleSave} disabled={saving || roleId === targetUser?.roleId}
                            className="px-5 py-2 rounded-xl bg-black text-white text-[14px] font-semibold hover:bg-zinc-800 transition-colors flex items-center gap-2 disabled:opacity-50">
                            {saving && <Loader2 size={14} className="animate-spin" />} Kaydet
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Update Password Modal
// ─────────────────────────────────────────────
function UpdatePasswordModal({ targetUser, currentUser, onClose, onSaved }) {
    const isSuperAdmin = currentUser?.roleId === ROLES.superAdmin;
    const isTargetAdmin = targetUser?.roleId === ROLES.admin || targetUser?.roleId === ROLES.superAdmin;
    const canChangePassword = isSuperAdmin || !isTargetAdmin;

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [saving, setSaving] = useState(false);
    const [flash, setFlash] = useState(null);

    const handleSave = async () => {
        if (password !== confirm) { setFlash({ type: 'error', message: 'Şifreler eşleşmiyor.' }); return; }
        if (password.length < 6) { setFlash({ type: 'error', message: 'Şifre en az 6 karakter olmalıdır.' }); return; }
        setSaving(true);
        setFlash(null);
        try {
            await userAdminService.updateUserPassword(targetUser.id, password);
            onSaved && onSaved();
            onClose();
        } catch (err) {
            setFlash({ type: 'error', message: err.response?.data?.message || err.message || 'Bir hata oluştu.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                    <h3 className="text-[17px] font-bold text-zinc-900">Şifre Güncelle</h3>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-zinc-100 transition-colors"><X size={18} /></button>
                </div>
                <div className="px-6 py-5 space-y-4">
                    <Flash {...(flash || {})} onClose={() => setFlash(null)} />
                    <div className="flex items-center gap-3 pb-4 border-b border-zinc-100">
                        <img src={targetUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(targetUser?.fullname || 'U')}&background=18181b&color=fff&size=100`}
                            className="w-10 h-10 rounded-full object-cover" alt="" />
                        <div>
                            <p className="font-semibold text-[14px] text-zinc-900">{targetUser?.fullname}</p>
                            <RoleBadge roleId={targetUser?.roleId} />
                        </div>
                    </div>
                    {!canChangePassword ? (
                        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-[13px] text-amber-700 flex items-center gap-2">
                            <Shield size={15} className="shrink-0" />
                            Admin şifrelerini yalnızca Super Admin değiştirebilir.
                        </div>
                    ) : (
                        <>
                            <Field label="Yeni Şifre">
                                <div className="relative">
                                    <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                                        placeholder="En az 6 karakter" className={inputCls + ' pr-11'} />
                                    <button type="button" onClick={() => setShowPw(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors">
                                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </Field>
                            <Field label="Şifre Tekrar">
                                <input type={showPw ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)}
                                    placeholder="Şifreyi tekrar girin" className={inputCls} />
                            </Field>
                        </>
                    )}
                </div>
                <div className="px-6 pb-5 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700 text-[14px] font-semibold hover:bg-zinc-50 transition-colors">İptal</button>
                    {canChangePassword && (
                        <button onClick={handleSave} disabled={saving || !password}
                            className="px-5 py-2 rounded-xl bg-black text-white text-[14px] font-semibold hover:bg-zinc-800 transition-colors flex items-center gap-2 disabled:opacity-50">
                            {saving && <Loader2 size={14} className="animate-spin" />} Kaydet
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────
function Pagination({ paging, pageRowCount, onPageChange, onRowCountChange }) {
    if (!paging) return null;
    const { pageNumber, pageCount, totalRowCount } = paging;
    return (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-100 flex-wrap gap-3">
            <div className="flex items-center gap-2 text-[13px] text-zinc-500">
                <span>Sayfa başı:</span>
                {[25, 50, 100].map(n => (
                    <button key={n} onClick={() => onRowCountChange(n)}
                        className={`w-9 h-7 rounded-lg text-[13px] font-semibold transition-colors ${pageRowCount === n ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>
                        {n}
                    </button>
                ))}
                <span className="ml-2 text-zinc-400">— Toplam {totalRowCount} kullanıcı</span>
            </div>
            <div className="flex items-center gap-1">
                <button disabled={pageNumber <= 1} onClick={() => onPageChange(pageNumber - 1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-zinc-100 transition-colors disabled:opacity-30">
                    <ChevronLeft size={16} />
                </button>
                <span className="text-[13px] font-medium text-zinc-700 px-2">{pageNumber} / {pageCount || 1}</span>
                <button disabled={pageNumber >= pageCount} onClick={() => onPageChange(pageNumber + 1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-zinc-100 transition-colors disabled:opacity-30">
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Main UserManager component
// ─────────────────────────────────────────────
export default function UserManager() {
    const { user: currentUser } = useUser();
    const isSuperAdmin = currentUser?.roleId === ROLES.superAdmin;
    const isAdmin = currentUser?.roleId === ROLES.admin;

    // List state
    const [users, setUsers] = useState([]);
    const [paging, setPaging] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageRowCount, setPageRowCount] = useState(25);
    const [keyword, setKeyword] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [listFlash, setListFlash] = useState(null);

    // Modal state
    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [roleTarget, setRoleTarget] = useState(null);
    const [pwTarget, setPwTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Debounce ref
    const searchTimer = useRef(null);

    const fetchUsers = useCallback(async (kw, pn, prc, rf) => {
        setLoading(true);
        try {
            let result;
            if (kw && kw.length >= 3) {
                result = await userAdminService.searchUsers(kw, { pageNumber: pn, pageRowCount: prc, ...(rf ? { roleId: rf } : {}) });
            } else {
                result = await userAdminService.listUsers({ pageNumber: pn, pageRowCount: prc, ...(rf ? { roleId: rf } : {}) });
            }
            setUsers(result.users || []);
            setPaging(result.paging || null);
        } catch (err) {
            setListFlash({ type: 'error', message: err.response?.data?.message || err.message || 'Kullanıcılar yüklenemedi.' });
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchUsers(keyword, pageNumber, pageRowCount, roleFilter);
    }, [pageNumber, pageRowCount, roleFilter]); // eslint-disable-line

    // Search debounce
    const handleSearchChange = (val) => {
        setKeyword(val);
        clearTimeout(searchTimer.current);
        setPageNumber(1);
        if (val.length === 0) {
            fetchUsers('', 1, pageRowCount, roleFilter);
        } else if (val.length >= 3) {
            searchTimer.current = setTimeout(() => fetchUsers(val, 1, pageRowCount, roleFilter), 350);
        }
    };

    const reload = () => fetchUsers(keyword, pageNumber, pageRowCount, roleFilter);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            await userAdminService.deleteUser(deleteTarget.id);
            setDeleteTarget(null);
            setListFlash({ type: 'success', message: `${deleteTarget.fullname} silindi.` });
            reload();
        } catch (err) {
            setListFlash({ type: 'error', message: err.response?.data?.message || err.message || 'Silme işlemi başarısız.' });
        } finally {
            setDeleteLoading(false);
        }
    };

    // Can current admin delete target?
    const canDelete = (target) => {
        if (target.roleId === ROLES.superAdmin) return false; // never
        if (target.roleId === ROLES.admin) return isSuperAdmin; // only superAdmin
        return isSuperAdmin || isAdmin;
    };

    // Can current admin change password of target?
    const canChangePassword = (target) => {
        if (target.roleId === ROLES.superAdmin) return isSuperAdmin;
        if (target.roleId === ROLES.admin) return isSuperAdmin;
        return isSuperAdmin || isAdmin;
    };

    // Can current admin update role of target?
    const canUpdateRole = (target) => {
        if (target.roleId === ROLES.superAdmin) return false;
        return isSuperAdmin || isAdmin;
    };

    const roleBgMap = {
        superAdmin: 'rgba(251,191,36,0.08)',
        admin: 'rgba(59,130,246,0.06)',
        user: 'transparent',
    };

    const roleFilter_options = [
        { value: '', label: 'Tüm Roller' },
        { value: ROLES.superAdmin, label: 'Super Admin' },
        { value: ROLES.admin, label: 'Admin' },
        { value: ROLES.user, label: 'Kullanıcı' },
    ];

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <div>
                    <h2 className="text-[18px] font-bold text-zinc-900">Kullanıcı Yönetimi</h2>
                    <p className="text-[13px] text-zinc-500 mt-0.5">Platformdaki kullanıcıları yönetin.</p>
                </div>
                <button onClick={() => setCreateOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white text-[13px] font-bold hover:bg-zinc-800 transition-colors shadow-sm">
                    <UserPlus size={15} /> Yeni Kullanıcı
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-4 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="text"
                        value={keyword}
                        onChange={e => handleSearchChange(e.target.value)}
                        placeholder="İsim veya e-posta ile ara (min. 3 harf)…"
                        className="w-full h-10 pl-9 pr-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                    />
                    {keyword && (
                        <button onClick={() => handleSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"><X size={14} /></button>
                    )}
                </div>

                <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPageNumber(1); }}
                    className="h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all">
                    {roleFilter_options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>

                <button onClick={reload} disabled={loading}
                    className="w-10 h-10 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-center hover:bg-zinc-100 transition-colors disabled:opacity-50">
                    <RefreshCw size={15} className={loading ? 'animate-spin text-zinc-400' : 'text-zinc-500'} />
                </button>
            </div>

            {/* Flash */}
            <Flash {...(listFlash || {})} onClose={() => setListFlash(null)} />

            {/* Table */}
            <div className="rounded-xl border border-zinc-200 overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-[auto_1fr_140px_100px_120px] gap-0 bg-zinc-50 border-b border-zinc-200">
                    <div className="px-4 py-2.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider w-14">Foto</div>
                    <div className="px-4 py-2.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Kullanıcı</div>
                    <div className="px-4 py-2.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Telefon</div>
                    <div className="px-4 py-2.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Rol</div>
                    <div className="px-4 py-2.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider text-right">İşlemler</div>
                </div>

                {/* Rows */}
                {loading ? (
                    <div className="flex items-center justify-center py-16 text-zinc-400">
                        <Loader2 size={22} className="animate-spin mr-2" /> Yükleniyor…
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
                        <UserIcon size={32} className="mb-3 opacity-30" />
                        <p className="text-[14px]">Kullanıcı bulunamadı.</p>
                    </div>
                ) : (
                    users.map((u, idx) => {
                        const avatarSrc = u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullname || 'U')}&background=18181b&color=fff&size=100`;
                        const isMe = u.id === currentUser?.id;
                        return (
                            <div key={u.id}
                                className={`grid grid-cols-[auto_1fr_140px_100px_120px] items-center gap-0 border-b border-zinc-100 last:border-0 hover:bg-zinc-50/60 transition-colors ${idx % 2 === 1 ? 'bg-zinc-50/30' : ''}`}
                                style={{ background: roleBgMap[u.roleId] }}>
                                {/* Avatar */}
                                <div className="px-3 py-3 w-14">
                                    <div className="relative">
                                        <img src={avatarSrc} alt={u.fullname} className="w-9 h-9 rounded-full object-cover ring-2 ring-white" />
                                        {u.isActive === false && (
                                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-red-400 rounded-full border-2 border-white" title="Pasif" />
                                        )}
                                    </div>
                                </div>

                                {/* User info */}
                                <div className="px-2 py-3 min-w-0">
                                    <p className="text-[13px] font-semibold text-zinc-900 truncate flex items-center gap-1.5">
                                        {u.fullname}
                                        {isMe && <span className="text-[10px] bg-zinc-200 text-zinc-600 px-1.5 py-0.5 rounded-full font-bold">Siz</span>}
                                    </p>
                                    <p className="text-[12px] text-zinc-400 truncate">{u.email}</p>
                                    <div className="flex gap-1.5 mt-1">
                                        {u.emailVerified && <span className="text-[10px] bg-green-50 border border-green-200 text-green-700 px-1.5 py-0.5 rounded-full font-bold">✓ E-posta</span>}
                                        {u.mobileVerified && <span className="text-[10px] bg-green-50 border border-green-200 text-green-700 px-1.5 py-0.5 rounded-full font-bold">✓ Telefon</span>}
                                        {u.isPublic === false && <span className="text-[10px] bg-zinc-100 border border-zinc-200 text-zinc-500 px-1.5 py-0.5 rounded-full font-bold">Gizli</span>}
                                    </div>
                                </div>

                                {/* Mobile */}
                                <div className="px-4 py-3">
                                    <p className="text-[12px] text-zinc-500 truncate">{u.mobile || '—'}</p>
                                </div>

                                {/* Role */}
                                <div className="px-4 py-3">
                                    <RoleBadge roleId={u.roleId} />
                                </div>

                                {/* Actions */}
                                <div className="px-3 py-3 flex items-center justify-end gap-1">
                                    <button onClick={() => setEditTarget(u)} title="Düzenle"
                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-800 hover:bg-zinc-200 transition-all">
                                        <Edit2 size={13} />
                                    </button>
                                    {canUpdateRole(u) && (
                                        <button onClick={() => setRoleTarget(u)} title="Rol Güncelle"
                                            className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-blue-700 hover:bg-blue-50 transition-all">
                                            <ShieldCheck size={13} />
                                        </button>
                                    )}
                                    {canChangePassword(u) && (
                                        <button onClick={() => setPwTarget(u)} title="Şifre"
                                            className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-violet-700 hover:bg-violet-50 transition-all">
                                            <Key size={13} />
                                        </button>
                                    )}
                                    {canDelete(u) && (
                                        <button onClick={() => setDeleteTarget(u)} title="Sil"
                                            className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all">
                                            <Trash2 size={13} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            <Pagination
                paging={paging}
                pageRowCount={pageRowCount}
                onPageChange={(p) => setPageNumber(p)}
                onRowCountChange={(n) => { setPageRowCount(n); setPageNumber(1); }}
            />

            {/* Modals */}
            {createOpen && (
                <UserFormModal mode="create" currentUser={currentUser} onClose={() => setCreateOpen(false)} onSaved={() => { reload(); setListFlash({ type: 'success', message: 'Yeni kullanıcı oluşturuldu.' }); }} />
            )}
            {editTarget && (
                <UserFormModal mode="edit" targetUser={editTarget} currentUser={currentUser} onClose={() => setEditTarget(null)} onSaved={() => { reload(); setListFlash({ type: 'success', message: 'Kullanıcı güncellendi.' }); }} />
            )}
            {roleTarget && (
                <UpdateRoleModal targetUser={roleTarget} currentUser={currentUser} onClose={() => setRoleTarget(null)} onSaved={() => { reload(); setListFlash({ type: 'success', message: 'Kullanıcı rolü güncellendi.' }); }} />
            )}
            {pwTarget && (
                <UpdatePasswordModal targetUser={pwTarget} currentUser={currentUser} onClose={() => setPwTarget(null)} onSaved={() => setListFlash({ type: 'success', message: 'Şifre güncellendi.' })} />
            )}
            <ConfirmDialog
                open={!!deleteTarget}
                danger
                title="Kullanıcıyı Sil"
                message={`"${deleteTarget?.fullname}" adlı kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
                confirmLabel="Sil"
                loading={deleteLoading}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}
