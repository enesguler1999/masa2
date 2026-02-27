import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../../components/common/Button';
import Link from '../../components/common/Link';
import AuthLayout from '../../components/auth/AuthLayout';
import { authService, verificationService } from '../../services/authService';
import { bucketService } from '../../services/bucketService';
import { profileService } from '../../services/profileService';
import Input from '../../components/forms/Input';
import { useUser } from '../../context/UserContext';

const RESEND_COOLDOWN = 60;
const STEPS = ['Bilgiler', 'Şifre', 'Doğrulama', 'Profil Fotoğrafı'];

export default function Register() {
    // Step state
    const [step, setStep] = useState(1);

    // Step 1
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');          // final value sent to backend e.g. +905554035730
    const [countryCode, setCountryCode] = useState('+90');
    const [phoneDigits, setPhoneDigits] = useState(''); // raw digits only e.g. 5554035730

    // Step 2
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');

    // Step 3 – verification
    const [verifyCode, setVerifyCode] = useState('');
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [verifyStartLoading, setVerifyStartLoading] = useState(false);
    const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
    const [canResend, setCanResend] = useState(false);
    const timerRef = useRef(null);
    const verificationStarted = useRef(false);

    // After registration
    const [registeredUser, setRegisteredUser] = useState(null); // user object from register
    const [sessionToken, setSessionToken] = useState(null);     // token after auto-login
    const [sessionBucketToken, setSessionBucketToken] = useState(null);
    const [sessionUserId, setSessionUserId] = useState(null);

    // Step 4 – avatar
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarUploading, setAvatarUploading] = useState(false);

    // Global
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const navigate = useNavigate();
    const location = useLocation();
    const { refreshUser } = useUser();
    const searchParams = new URLSearchParams(location.search);
    const socialKey = searchParams.get('social');
    const isSocial = socialKey === 'true';

    useEffect(() => {
        if (isSocial) {
            const storedAccountInfo = JSON.parse(sessionStorage.getItem('socialAccountInfo') || '{}');
            const storedSocialCode = sessionStorage.getItem('socialCode');
            if (storedSocialCode) {
                if (storedAccountInfo.email) setEmail(storedAccountInfo.email);
                if (storedAccountInfo.fullname) setFullname(storedAccountInfo.fullname);
            }
        }
    }, [isSocial]);

    // ─── Countdown ───────────────────────────────────────────────────────────
    const startCountdown = () => {
        setCountdown(RESEND_COOLDOWN);
        setCanResend(false);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    useEffect(() => {
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    // ─── Step 3: start phone verification after register ─────────────────────
    useEffect(() => {
        if (step === 3 && !verificationStarted.current) {
            verificationStarted.current = true;
            (async () => {
                setVerifyStartLoading(true);
                setError('');
                try {
                    await verificationService.startMobileVerification(email);
                    setSuccessMessage('Doğrulama kodu telefonunuza gönderildi.');
                    startCountdown();
                } catch (err) {
                    setError(err.response?.data?.message || 'Doğrulama kodu gönderilemedi.');
                } finally {
                    setVerifyStartLoading(false);
                }
            })();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step]);

    // ─── Step 1 submit ────────────────────────────────────────────────────────
    // Format digits as XXX-XXX-XXXX
    const formatPhoneDisplay = (digits) => {
        const d = digits.replace(/\D/g, '').slice(0, 10);
        if (d.length <= 3) return d;
        if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
        return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
    };

    const handlePhoneInput = (e) => {
        const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
        setPhoneDigits(raw);
        setMobile(`${countryCode}${raw}`);
    };

    const handleStep1 = (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        if (!fullname.trim()) return setError('Lütfen adınızı ve soyadınızı girin.');
        if (!email.trim()) return setError('Lütfen e-posta adresinizi girin.');
        if (phoneDigits.length < 10) return setError('Lütfen geçerli bir telefon numarası girin (10 rakam).');
        setStep(2);
    };

    // ─── Step 2 submit ────────────────────────────────────────────────────────
    const handleStep2 = async (e) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) return setError('Şifre en az 6 karakter olmalıdır.');
        if (password !== passwordConfirm) return setError('Şifreler eşleşmiyor.');
        setLoading(true);
        try {
            const payload = { fullname, email, password, mobile, isPublic: true };
            if (isSocial) payload.socialCode = sessionStorage.getItem('socialCode');

            const result = await authService.registerUser(payload);

            // Store registered user info
            setRegisteredUser(result.user);

            // If register returned an accessToken (auto-login), store it
            if (result.accessToken) {
                localStorage.setItem('accessToken', result.accessToken);
                setSessionToken(result.accessToken);
                setSessionUserId(result.userId);
                setSessionBucketToken(result.userBucketToken || null);
            }

            sessionStorage.removeItem('socialAccountInfo');
            sessionStorage.removeItem('socialCode');

            // Proceed to phone verification step
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Hesap oluşturulurken beklenmedik bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    // ─── Step 3: resend code ──────────────────────────────────────────────────
    const handleResendCode = async () => {
        setError('');
        setSuccessMessage('');
        try {
            await verificationService.startMobileVerification(email);
            setSuccessMessage('Doğrulama kodu tekrar gönderildi.');
            startCountdown();
        } catch (err) {
            setError(err.response?.data?.message || 'Kod gönderilirken bir hata oluştu.');
        }
    };

    // ─── Step 3: verify code → auto-login ────────────────────────────────────
    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        setVerifyLoading(true);
        try {
            const result = await verificationService.completeMobileVerification(email, verifyCode);
            if (result.isVerified) {
                // Auto-login
                try {
                    const loginResult = await authService.login({ username: email, password });
                    if (loginResult.accessToken) {
                        localStorage.setItem('accessToken', loginResult.accessToken);
                        setSessionToken(loginResult.accessToken);
                        setSessionUserId(loginResult.userId);
                        setSessionBucketToken(loginResult.userBucketToken || null);
                    }
                } catch (_) {
                    // Login may fail if already logged in from register response, proceed anyway
                }
                setStep(4);
            } else {
                setError('Doğrulama başarısız oldu. Lütfen tekrar deneyin.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Geçersiz doğrulama kodu.');
        } finally {
            setVerifyLoading(false);
        }
    };

    // ─── Step 4: file select ──────────────────────────────────────────────────
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    // ─── Step 4: upload & finish ──────────────────────────────────────────────
    const handleAvatarUpload = async () => {
        setError('');
        if (!avatarFile) {
            // Skip avatar, go home
            await refreshUser();
            navigate('/');
            return;
        }
        setAvatarUploading(true);
        try {
            // We need the bucket token. Try from session state or fetch /currentuser
            let bucketToken = sessionBucketToken;
            let userId = sessionUserId;

            if (!bucketToken || !userId) {
                try {
                    const sessionData = await authService.getCurrentUser();
                    bucketToken = sessionData.userBucketToken;
                    userId = sessionData.userId;
                    setSessionUserId(userId);
                    setSessionBucketToken(sessionData.userBucketToken);
                } catch (_) { }
            }

            if (!bucketToken) throw new Error('Bucket token alınamadı.');
            if (!userId) throw new Error('Kullanıcı kimliği alınamadı.');

            // Upload to user's public bucket
            const bucketId = `${userId}-public-user-bucket`;
            const uploadResult = await bucketService.uploadFile(bucketToken, bucketId, avatarFile);
            const downloadUrl = uploadResult?.data?.[0]?.downloadUrl;

            if (downloadUrl) {
                // Update user profile with the avatar URL
                await profileService.updateProfile(userId, { avatar: downloadUrl });
            }

            await refreshUser();
            navigate('/');
        } catch (err) {
            setError(err.message || err.response?.data?.message || 'Fotoğraf yüklenirken bir hata oluştu.');
        } finally {
            setAvatarUploading(false);
        }
    };

    const handleSkipAvatar = async () => {
        await refreshUser();
        navigate('/');
    };

    // ─── Google login ─────────────────────────────────────────────────────────
    const handleGoogleLogin = () => {
        authService.initiateSocialLogin('google');
    };

    // ─── Step indicator ───────────────────────────────────────────────────────
    const StepIndicator = () => (
        <div className="flex items-center justify-between mb-8 relative">
            <div className="absolute top-[15px] left-0 right-0 h-[2px] bg-zinc-200 z-0">
                <div
                    className="h-full bg-black transition-all duration-500"
                    style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
                />
            </div>
            {STEPS.map((label, i) => {
                const stepNum = i + 1;
                const isActive = step === stepNum;
                const isDone = step > stepNum;
                return (
                    <div key={i} className="flex flex-col items-center z-10 gap-1.5">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${isDone
                                ? 'bg-black text-white'
                                : isActive
                                    ? 'bg-black text-white ring-4 ring-black/10'
                                    : 'bg-zinc-200 text-zinc-400'
                                }`}
                        >
                            {isDone ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                stepNum
                            )}
                        </div>
                        <span className={`text-[11px] font-medium hidden sm:block ${isActive ? 'text-zinc-900' : 'text-zinc-400'}`}>
                            {label}
                        </span>
                    </div>
                );
            })}
        </div>
    );

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <AuthLayout>
            <div className="w-full">
                <h1 className="text-3xl font-bold text-zinc-900 mb-2 mt-4 tracking-tight">Kayıt Ol</h1>
                <p className="text-zinc-500 mb-8 text-[15px]">
                    Masa'ya katılın ve yakınınızdaki yeni deneyimleri keşfetmeye hemen başlayın.
                </p>

                <StepIndicator />

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

                {/* ── Step 1: Name, Email, Phone ── */}
                {step === 1 && (
                    <form onSubmit={handleStep1} className="space-y-4">
                        <Input
                            id="fullname"
                            label="Ad Soyad"
                            type="text"
                            value={fullname}
                            onChange={(e) => setFullname(e.target.value)}
                            placeholder="Adınızı ve soyadınızı girin"
                            required
                        />
                        <Input
                            id="email"
                            label="E-posta"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={isSocial ? 'bg-zinc-100 text-zinc-500 cursor-not-allowed' : ''}
                            placeholder="E-posta adresinizi girin"
                            required
                            readOnly={isSocial}
                        />
                        {/* ── Phone field with country code selector ── */}
                        <div>
                            <label className="block text-[13px] font-semibold text-zinc-700 mb-1.5">Telefon Numarası</label>
                            <div className="flex rounded-xl overflow-hidden border border-zinc-200 bg-white focus-within:ring-2 focus-within:ring-black/10 focus-within:border-zinc-400 transition-all">
                                {/* Country code selector */}
                                <select
                                    value={countryCode}
                                    onChange={(e) => {
                                        setCountryCode(e.target.value);
                                        setMobile(`${e.target.value}${phoneDigits}`);
                                    }}
                                    className="bg-zinc-50 border-r border-zinc-200 text-zinc-800 font-semibold text-[14px] px-3 py-3 focus:outline-none shrink-0"
                                >
                                    <option value="+90">🇹🇷 +90</option>
                                </select>
                                {/* Number input with auto-format */}
                                <input
                                    id="mobile"
                                    type="tel"
                                    inputMode="numeric"
                                    value={formatPhoneDisplay(phoneDigits)}
                                    onChange={handlePhoneInput}
                                    placeholder="545-403-5730"
                                    className="flex-1 px-4 py-3 text-[14px] text-zinc-900 font-medium placeholder:text-zinc-400 focus:outline-none bg-transparent"
                                    required
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full mt-4 h-[52px] !rounded-xl">
                            Devam Et
                        </Button>

                        <div className="mt-8 relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-zinc-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 text-[13px] font-medium bg-zinc-50 text-zinc-500 uppercase tracking-widest">veya</span>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Button
                                onClick={handleGoogleLogin}
                                type="button"
                                variant="secondary"
                                className="w-full h-[52px] !rounded-xl flex items-center justify-center space-x-2.5"
                            >
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-[18px] h-[18px]" />
                                <span className="text-[15px]">Google ile Devam Et</span>
                            </Button>
                        </div>

                        <p className="mt-6 text-center text-[15px] text-zinc-600">
                            Zaten bir hesabınız var mı?{' '}
                            <Link to="/login" variant="secondary">Giriş Yap</Link>
                        </p>
                    </form>
                )}

                {/* ── Step 2: Password ── */}
                {step === 2 && (
                    <form onSubmit={handleStep2} className="space-y-4">
                        <div className="p-3 bg-zinc-100 rounded-xl text-[13px] text-zinc-500 mb-2">
                            <span className="font-medium text-zinc-700">{fullname}</span> · {email} · <span className="font-mono">{countryCode} {formatPhoneDisplay(phoneDigits)}</span>
                        </div>

                        <Input
                            id="password"
                            label="Şifre"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="En az 6 karakter"
                            required
                            autoFocus
                        />
                        <Input
                            id="password-confirm"
                            label="Şifre (Tekrar)"
                            type="password"
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            placeholder="Şifrenizi tekrar girin"
                            required
                        />

                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => { setError(''); setStep(1); }}
                                className="flex-1 h-[52px] !rounded-xl"
                            >
                                Geri
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-[2] h-[52px] !rounded-xl"
                            >
                                {loading ? 'Hesap oluşturuluyor...' : 'Hesap Oluştur'}
                            </Button>
                        </div>
                    </form>
                )}

                {/* ── Step 3: Mobile Verification ── */}
                {step === 3 && (
                    <div>
                        {verifyStartLoading && (
                            <div className="mb-6 p-4 bg-zinc-100 text-zinc-600 rounded-xl text-[14px] font-medium border border-zinc-200 leading-relaxed flex items-center gap-3">
                                <svg className="animate-spin h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Doğrulama kodu gönderiliyor...
                            </div>
                        )}

                        <p className="text-zinc-500 text-[15px] mb-6">
                            <strong>{mobile}</strong> numarasına gönderilen 6 haneli kodu girin.
                        </p>

                        <form onSubmit={handleVerify} className="space-y-4">
                            <Input
                                id="verify-code"
                                label="Doğrulama Kodu"
                                type="text"
                                value={verifyCode}
                                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="123456"
                                required
                                maxLength={6}
                                autoFocus
                            />
                            <Button
                                type="submit"
                                disabled={verifyLoading || verifyCode.length < 6}
                                className="w-full h-[52px] !rounded-xl"
                            >
                                {verifyLoading ? 'Doğrulanıyor...' : 'Doğrula ve Devam Et'}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-[15px] text-zinc-600">
                                Kodu almadınız mı?{' '}
                                {canResend ? (
                                    <button
                                        type="button"
                                        onClick={handleResendCode}
                                        className="text-zinc-900 font-medium hover:underline transition-opacity"
                                    >
                                        Tekrar Gönder
                                    </button>
                                ) : (
                                    <span className="text-zinc-400 font-medium">
                                        Tekrar Gönder ({countdown}s)
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Step 4: Profile Photo ── */}
                {step === 4 && (
                    <div className="flex flex-col items-center">
                        <p className="text-zinc-500 text-[15px] mb-8 text-center">
                            Profilinize bir fotoğraf ekleyin. İstediğiniz zaman değiştirebilirsiniz.
                        </p>

                        {/* Avatar preview */}
                        <div className="relative mb-6">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-zinc-100 flex items-center justify-center">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <svg className="w-16 h-16 text-zinc-300" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                                    </svg>
                                )}
                            </div>
                            <label
                                htmlFor="avatar-upload"
                                className="absolute bottom-0 right-0 w-10 h-10 bg-black rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-zinc-800 transition-colors"
                            >
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>

                        {avatarFile && (
                            <p className="text-[13px] text-zinc-500 mb-4">{avatarFile.name}</p>
                        )}

                        <div className="flex flex-col gap-3 w-full mt-2">
                            <Button
                                onClick={handleAvatarUpload}
                                disabled={avatarUploading}
                                className="w-full h-[52px] !rounded-xl"
                            >
                                {avatarUploading
                                    ? 'Yükleniyor...'
                                    : avatarFile
                                        ? 'Fotoğrafı Yükle ve Devam Et'
                                        : 'Devam Et'}
                            </Button>
                            {avatarFile && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={handleSkipAvatar}
                                    className="w-full h-[44px] !rounded-xl text-[14px]"
                                >
                                    Şimdilik Atla
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AuthLayout>
    );
}
